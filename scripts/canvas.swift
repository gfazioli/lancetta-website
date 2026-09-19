#!/usr/bin/env swift
import AppKit

/*
 * Centre a PNG on a transparent canvas of a given size, without resampling it.
 *
 *   swift scripts/canvas.swift <in.png> <out.png> <width> <height>
 *
 * The hero shows four captures of the same window in the same box, one per frame,
 * cross-fading in place. `object-fit: contain` scales each one to fit, so a capture
 * with a different aspect ratio is drawn at a different scale -- and since these are
 * all 900-point-wide windows, a difference in HEIGHT alone made the window visibly
 * change width as the reader scrolled from one pane to the next. That is the defect
 * the user reported for Overview against Usage, arriving by a second route.
 *
 * The heights differ because the window's minimum grew: the three panes published
 * earlier are 588 points tall and the app will not open below 628 any more. So they
 * cannot simply be re-shot at one size, and scaling one to match would draw a window
 * at proportions it does not have.
 *
 * Padding is the answer that keeps every window at its true size AND at one scale:
 * the images become one canvas, `contain` therefore gives them all the same box, and
 * each window is drawn 1:1 within it -- same width, because they are the same width,
 * and a taller window simply reaches further up and down. The added margin is fully
 * transparent, so nothing appears anywhere.
 *
 * It draws at 1:1 into a canvas of exactly the pixel size asked for -- no `sips -z`,
 * which resamples, and no `NSImage.size`, which is in POINTS and would silently halve
 * a Retina capture.
 */

let args = Array(CommandLine.arguments.dropFirst())
guard args.count == 4,
      let width = Int(args[2]), let height = Int(args[3]), width > 0, height > 0 else {
    print("usage: swift scripts/canvas.swift <in.png> <out.png> <width> <height>")
    exit(2)
}

guard let image = NSImage(contentsOfFile: args[0]),
      let source = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    FileHandle.standardError.write("cannot read \(args[0])\n".data(using: .utf8)!)
    exit(1)
}

guard source.width <= width, source.height <= height else {
    FileHandle.standardError.write(
        "\(args[0]) is \(source.width)x\(source.height), larger than the \(width)x\(height) canvas\n"
            .data(using: .utf8)!)
    exit(1)
}

guard let ctx = CGContext(data: nil, width: width, height: height, bitsPerComponent: 8,
                          bytesPerRow: 0, space: CGColorSpaceCreateDeviceRGB(),
                          bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else {
    FileHandle.standardError.write("cannot make a \(width)x\(height) context\n".data(using: .utf8)!)
    exit(1)
}

// Centred, and on an EVEN offset where the remainder allows: an odd inset on a 2x
// capture lands the window on a half-point in CSS and softens its hairline border.
let x = ((width - source.width) / 2) & ~1
let y = ((height - source.height) / 2) & ~1
ctx.draw(source, in: CGRect(x: x, y: y, width: source.width, height: source.height))

guard let out = ctx.makeImage(),
      let data = NSBitmapImageRep(cgImage: out).representation(using: .png, properties: [:]) else {
    FileHandle.standardError.write("cannot encode the result\n".data(using: .utf8)!)
    exit(1)
}
try data.write(to: URL(fileURLWithPath: args[1]))
print("\(args[0]) \(source.width)x\(source.height) -> \(args[1]) \(width)x\(height) at \(x),\(y)")

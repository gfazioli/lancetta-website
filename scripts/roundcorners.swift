import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

// Cut a capture's corners to TRANSPARENCY, and read the pixels that decide the
// radius. Sibling of `deshadow.swift`: that one strips a shadow baked into a
// capture, this one strips the square corner baked into one.
//
// Why it exists. `screenshot-pace.png` is the panel's card plus about twelve
// pixels of the panel's own background, and that surround is SQUARE and fully
// opaque -- measured 2026-09-21, the top row reads #1E2244 uniformly from x=0
// to x=19 with alpha 255, against the card's #1B2137, and the card's own stroke
// appears at (12,12). So the card inside is rounded and the picture is not, and
// on a light page the four square corners are what the eye reads. Worse, the
// page's `drop-shadow` follows the PNG's alpha (see HeroStage.module.css), so a
// fully opaque rectangle casts a RECTANGULAR shadow around a rounded object.
// Cutting the corners fixes the shape and the shadow in one edit.
//
//   roundcorners profile <png>              -- the corner pixels, to read by eye
//   roundcorners cut <png> <radius> <out>   -- write the alpha-cut copy
//
// Use `profile` and decide; do NOT ask a script for "the radius". The first
// version of this tool did, by walking the top row for the first pixel matching
// the card colour -- and it answered 0 both when the match was at x=0 and when
// there was no match at all, which is the same number for "found immediately"
// and "found nothing". It reported 0 on an image whose surround is twelve
// pixels deep. A measurement that cannot fail is not a measurement.
//
// The canvas SIZE is preserved on purpose. The hero draws its frames in one
// box, so a replacement at a different size is drawn at a different scale and
// the reader watches the artifact change size as they scroll -- reported twice
// (see CLAUDE.md, "The four window panes are ONE SET").

func load(_ path: String) -> CGImage? {
    guard let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: path) as CFURL, nil)
    else { return nil }
    return CGImageSourceCreateImageAtIndex(src, 0, nil)
}

let args = CommandLine.arguments
guard args.count >= 3, let img = load(args[2]) else {
    FileHandle.standardError.write(
        "usage: roundcorners profile <png> | cut <png> <radius> <out>\n".data(using: .utf8)!)
    exit(2)
}
let w = img.width, h = img.height

switch args[1] {
case "profile":
    var buf = [UInt8](repeating: 0, count: w * h * 4)
    let ctx = CGContext(data: &buf, width: w, height: h, bitsPerComponent: 8,
                        bytesPerRow: w * 4, space: CGColorSpaceCreateDeviceRGB(),
                        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    // Flip, so row 0 is the TOP row -- the way anyone looking at the picture
    // counts. CoreGraphics' origin is bottom-left and reading a corner profile
    // upside down is a silent way to measure the wrong corner.
    ctx.translateBy(x: 0, y: CGFloat(h))
    ctx.scaleBy(x: 1, y: -1)
    ctx.draw(img, in: CGRect(x: 0, y: 0, width: w, height: h))
    func hex(_ x: Int, _ y: Int) -> String {
        let i = (y * w + x) * 4
        return String(format: "#%02X%02X%02X a=%d", buf[i], buf[i + 1], buf[i + 2], buf[i + 3])
    }
    print("image \(w)x\(h)   centre \(hex(w / 2, h / 2))")
    print("\ntop row, x = 0…19:")
    for x in 0..<min(20, w) { print("  x=\(x)\t\(hex(x, 0))") }
    print("\nleft column, y = 0…19:")
    for y in 0..<min(20, h) { print("  y=\(y)\t\(hex(0, y))") }
    print("\ndiagonal in from the top-left corner:")
    for d in 0..<min(16, w, h) { print("  (\(d),\(d))\t\(hex(d, d))") }

case "cut":
    guard args.count >= 5, let radius = Double(args[3]) else {
        FileHandle.standardError.write("usage: roundcorners cut <png> <radius> <out>\n".data(using: .utf8)!)
        exit(2)
    }
    let out = args[4]
    let ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8,
                        bytesPerRow: 0, space: CGColorSpaceCreateDeviceRGB(),
                        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    ctx.clear(CGRect(x: 0, y: 0, width: w, height: h))
    // Clip, then draw. The corners keep nothing at all, and the curve is
    // antialiased by CoreGraphics rather than by a threshold of my own -- a
    // hand-rolled cutoff is what leaves a stair-stepped rim on a dark object.
    ctx.addPath(CGPath(roundedRect: CGRect(x: 0, y: 0, width: w, height: h),
                       cornerWidth: radius, cornerHeight: radius, transform: nil))
    ctx.clip()
    ctx.draw(img, in: CGRect(x: 0, y: 0, width: w, height: h))
    guard let result = ctx.makeImage(),
          let dst = CGImageDestinationCreateWithURL(
              URL(fileURLWithPath: out) as CFURL, UTType.png.identifier as CFString, 1, nil)
    else { exit(1) }
    CGImageDestinationAddImage(dst, result, nil)
    guard CGImageDestinationFinalize(dst) else { exit(1) }
    print("wrote \(out) — \(w)x\(h) preserved, corners cut at \(radius)px")

default:
    FileHandle.standardError.write("unknown verb \(args[1])\n".data(using: .utf8)!)
    exit(2)
}

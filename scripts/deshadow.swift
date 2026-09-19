#!/usr/bin/env swift
import AppKit

/*
 * Strip a baked drop shadow off a screenshot, and crop to what is left.
 *
 *   swift scripts/deshadow.swift <in.png> <out.png> [cutoff=0.45] [margin=2]
 *
 * The app's captures are taken against a dark desktop, where a soft shadow
 * around the object is what makes it sit on something. On a LIGHT page the same
 * shadow is a grey smudge: measured on the island capture of 2026-09-19, the
 * band under it rendered #D1D7EA against a #F0F1FD page, and it was the first
 * thing the eye went to.
 *
 * It is a measurement, not a judgement, which is why this is a tool and not a
 * one-off: in that file the shadow's PEAK alpha was 0.400 and the object's was
 * 1.000, with 105 pixels of antialiased rim in between out of 200k sampled. So
 * everything under the cutoff goes, the rest is rescaled so the rim stays
 * smooth rather than snapping, and the canvas is cropped to the solid bounding
 * box (plus `margin`) because `object-fit: contain` fits the whole canvas:
 * leaving 112px of now-transparent shadow on three sides would shrink the
 * object inside its own box and float it away from the bar it hangs from.
 *
 * Read the numbers it prints. A cutoff that swallows part of the object shows
 * up as a bounding box smaller than the object obviously is.
 */

let args = CommandLine.arguments
guard args.count >= 3 else {
    FileHandle.standardError.write(
        "usage: deshadow.swift <in.png> <out.png> [cutoff=0.45] [margin=2]\n".data(using: .utf8)!)
    exit(2)
}
let cutoff = args.count > 3 ? Double(args[3])! : 0.45
let margin = args.count > 4 ? Int(args[4])! : 2

guard let image = NSImage(contentsOfFile: args[1]),
      let src = image.representations.first as? NSBitmapImageRep else {
    FileHandle.standardError.write("cannot read \(args[1])\n".data(using: .utf8)!)
    exit(1)
}

let w = src.pixelsWide, h = src.pixelsHigh
var alpha = [Double](repeating: 0, count: w * h)
var rgb = [(Double, Double, Double)](repeating: (0, 0, 0), count: w * h)
for y in 0..<h {
    for x in 0..<w {
        guard let c = src.colorAt(x: x, y: y)?.usingColorSpace(.sRGB) else { continue }
        let a = Double(c.alphaComponent)
        // Below the cutoff it is shadow and goes; above it, rescaled so the
        // object's antialiased rim keeps a gradient instead of snapping.
        alpha[y * w + x] = a < cutoff ? 0 : (a - cutoff) / (1 - cutoff)
        rgb[y * w + x] = (Double(c.redComponent), Double(c.greenComponent), Double(c.blueComponent))
    }
}

var minX = w, maxX = -1, minY = h, maxY = -1
for y in 0..<h {
    for x in 0..<w where alpha[y * w + x] > 0 {
        if x < minX { minX = x }
        if x > maxX { maxX = x }
        if y < minY { minY = y }
        if y > maxY { maxY = y }
    }
}
guard maxX >= minX, maxY >= minY else {
    FileHandle.standardError.write("nothing survived the cutoff\n".data(using: .utf8)!)
    exit(1)
}

// The crop stays centred on the OBJECT, not on the old canvas: the island hangs
// from the middle of the bar, and half a pixel of drift there is visible.
let cx = Double(minX + maxX) / 2
var x0 = max(0, minX - margin), x1 = min(w - 1, maxX + margin)
let half = max(cx - Double(x0), Double(x1) - cx)
x0 = max(0, Int((cx - half).rounded(.down)))
x1 = min(w - 1, Int((cx + half).rounded(.up)))
let y0 = max(0, minY - margin), y1 = min(h - 1, maxY + margin)
let cw = x1 - x0 + 1, ch = y1 - y0 + 1

guard let out = NSBitmapImageRep(
    bitmapDataPlanes: nil, pixelsWide: cw, pixelsHigh: ch,
    bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
    colorSpaceName: .deviceRGB, bitmapFormat: .alphaNonpremultiplied,
    bytesPerRow: cw * 4, bitsPerPixel: 32),
      let data = out.bitmapData else {
    FileHandle.standardError.write("cannot allocate the output\n".data(using: .utf8)!)
    exit(1)
}
for y in 0..<ch {
    for x in 0..<cw {
        let s = (y + y0) * w + (x + x0), d = (y * cw + x) * 4
        let (r, g, b) = rgb[s]
        data[d] = UInt8(max(0, min(255, r * 255)))
        data[d + 1] = UInt8(max(0, min(255, g * 255)))
        data[d + 2] = UInt8(max(0, min(255, b * 255)))
        data[d + 3] = UInt8(max(0, min(255, alpha[s] * 255)))
    }
}
guard let png = out.representation(using: .png, properties: [:]) else { exit(1) }
try png.write(to: URL(fileURLWithPath: args[2]))
print("in  \(w)x\(h)  cutoff \(cutoff)")
print("solid x \(minX)...\(maxX)  y \(minY)...\(maxY)")
print("out \(cw)x\(ch) -> \(args[2])")

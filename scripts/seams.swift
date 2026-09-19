#!/usr/bin/env swift
import AppKit

/*
 * Find the hard horizontal seams in a page capture.
 *
 *   swift scripts/seams.swift <shot.png> [threshold=6] [gutter=120]
 *   swift scripts/seams.swift --selftest
 *
 * Every band on the home page paints its own wash, and the defect this exists
 * to catch is a wash that is at full strength exactly where its section begins:
 * the section above is plain body colour, so the join is a line across the
 * page. The eye reads a line across a page as a rule, which is why six soft
 * atmospheres added up to a page that looked ruled into strips.
 *
 * It is hard to judge by eye and trivial to measure. A seam is a step between
 * two ADJACENT rows; a wash is the same change spread over a hundred. So this
 * averages each row and prints the rows whose step from the one above is over
 * the threshold, in 0-255 units summed across the three channels.
 *
 * It samples the page's GUTTERS, not the full width: a row crossing a headline
 * or a card edge steps by tens of units for reasons that have nothing to do
 * with the background, and those are most rows on a page worth photographing.
 * The left and right margins outside the container are background and nothing
 * else, which is exactly the thing under test. On a capture whose content runs
 * edge to edge, raise the gutter or crop first.
 *
 * `--selftest` runs it over two synthetic images -- one hard edge, one ramp of
 * the same total size -- because a seam finder that reports nothing is
 * indistinguishable from a page with no seams, and "no seams" is the answer
 * nobody investigates.
 */

func pixels(_ path: String) -> (w: Int, h: Int, data: [UInt8])? {
    guard let image = NSImage(contentsOfFile: path),
          let cg = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else { return nil }
    let w = cg.width, h = cg.height
    var data = [UInt8](repeating: 0, count: w * h * 4)
    let space = CGColorSpaceCreateDeviceRGB()
    let info = CGImageAlphaInfo.premultipliedLast.rawValue
    guard let ctx = data.withUnsafeMutableBytes({ raw in
        CGContext(data: raw.baseAddress, width: w, height: h, bitsPerComponent: 8,
                  bytesPerRow: w * 4, space: space, bitmapInfo: info)
    }) else { return nil }
    ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
    return (w, h, data)
}

/// The mean colour of each row, taken over the left and right gutters only.
func rowMeans(_ w: Int, _ h: Int, _ data: [UInt8], gutter: Int) -> [(Double, Double, Double)] {
    let columns = Array(4..<min(gutter, w / 2)) + Array(max(w - gutter, w / 2)..<(w - 4))
    guard !columns.isEmpty else { return [] }
    return (0..<h).map { y in
        var r = 0.0, g = 0.0, b = 0.0
        for x in columns {
            let i = (y * w + x) * 4
            r += Double(data[i]); g += Double(data[i + 1]); b += Double(data[i + 2])
        }
        let n = Double(columns.count)
        return (r / n, g / n, b / n)
    }
}

func steps(_ means: [(Double, Double, Double)]) -> [(y: Int, step: Double)] {
    guard means.count > 1 else { return [] }
    return (1..<means.count).map { y in
        let a = means[y - 1], b = means[y]
        return (y, abs(a.0 - b.0) + abs(a.1 - b.1) + abs(a.2 - b.2))
    }
}

func report(_ path: String, threshold: Double, gutter: Int) -> Int {
    guard let (w, h, data) = pixels(path) else {
        FileHandle.standardError.write("cannot read \(path)\n".data(using: .utf8)!)
        return 2
    }
    let means = rowMeans(w, h, data, gutter: gutter)
    let all = steps(means)
    let hits = all.filter { $0.step >= threshold }
    let worst = all.max(by: { $0.step < $1.step })
    let name = (path as NSString).lastPathComponent
    print(String(format: "%@  %dx%d  gutter=%d  worst step %.2f at y=%d  over %.1f: %d",
                 name, w, h, gutter, worst?.step ?? 0, worst?.y ?? 0, threshold, hits.count))
    for hit in hits.prefix(12) {
        let a = means[hit.y - 1], b = means[hit.y]
        print(String(format: "  y=%4d  step %6.2f   %3.0f,%3.0f,%3.0f -> %3.0f,%3.0f,%3.0f",
                     hit.y, hit.step, a.0, a.1, a.2, b.0, b.1, b.2))
    }
    return hits.isEmpty ? 0 : 1
}

// ---------------------------------------------------------------- self-test

func synth(_ path: String, hardEdgeAt: Int?, rampOver: Int?) {
    let w = 400, h = 400
    let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: w, pixelsHigh: h,
                               bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true,
                               isPlanar: false, colorSpaceName: .deviceRGB,
                               bytesPerRow: w * 4, bitsPerPixel: 32)!
    // 40 units of blue, arriving either all at once or spread over `rampOver`.
    for y in 0..<h {
        var shift = 0.0
        if let edge = hardEdgeAt { shift = y >= edge ? 40 : 0 }
        if let over = rampOver {
            let start = (h - over) / 2
            shift = min(40, max(0, Double(y - start) / Double(over) * 40))
        }
        /*
         * The bytes directly, not `setColor(_:atX:y:)`. That path converts
         * through an NSColor and, on a `.deviceRGB` rep, answered
         * "Unrecognized colorspace number -1" and wrote nothing -- so both
         * fixtures came out flat and the self-test reported that the finder
         * could not see its own hard edge. Which is the self-test working:
         * the fixture was the broken half, and a run against the real page
         * would have looked clean for the same reason.
         */
        let value = UInt8(240 - shift)
        for x in 0..<w {
            let i = y * w * 4 + x * 4
            rep.bitmapData![i] = value
            rep.bitmapData![i + 1] = value
            rep.bitmapData![i + 2] = 250
            rep.bitmapData![i + 3] = 255
        }
    }
    try? rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: path))
}

if CommandLine.arguments.count > 1, CommandLine.arguments[1] == "--selftest" {
    let dir = NSTemporaryDirectory()
    let edge = dir + "seams-edge.png", ramp = dir + "seams-ramp.png"
    synth(edge, hardEdgeAt: 200, rampOver: nil)
    synth(ramp, hardEdgeAt: nil, rampOver: 200)
    print("a 40-unit step arriving at once, and the same 40 units over 200 rows:")
    let edgeHit = report(edge, threshold: 6, gutter: 120) == 1
    let rampHit = report(ramp, threshold: 6, gutter: 120) == 1
    print(edgeHit && !rampHit
          ? "PASS  the edge is found, the ramp is not"
          : "FAIL  edge found: \(edgeHit), ramp found: \(rampHit)")
    exit(edgeHit && !rampHit ? 0 : 1)
}

guard CommandLine.arguments.count > 1 else {
    print("usage: swift scripts/seams.swift <shot.png> [threshold=6] [gutter=120]")
    print("       swift scripts/seams.swift --selftest")
    exit(2)
}
let threshold = CommandLine.arguments.count > 2 ? Double(CommandLine.arguments[2])! : 6
let gutter = CommandLine.arguments.count > 3 ? Int(CommandLine.arguments[3])! : 120
exit(Int32(report(CommandLine.arguments[1], threshold: threshold, gutter: gutter)))

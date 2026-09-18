import AppKit
import CoreText

// The share images, drawn from the same sources as the page: the icon, the
// menu capture, and the six colours sampled off the icon (theme/global.css).
//
//   social <site-root>
//
// Writes app/opengraph-image.png and app/twitter-image.png (1200x630, the same
// picture) and .github/social-preview.png (1280x640, GitHub's own size, which
// still has to be uploaded by hand: Settings → General → Social preview).
//
// It is committed rather than recreated per session on purpose: the previous
// set was composed by a throwaway that no longer exists, so the day the icon
// changed there was nothing to re-run and the pictures were re-drawn from
// scratch. The trap worth keeping: NSBitmapImageRep's context is y-UP, so
// every "top" below is converted before drawing, and a picture that looks
// vertically mirrored is this and not the fonts.

let root = URL(fileURLWithPath: CommandLine.arguments[1])

// ── The icon's own light (theme/global.css) ──
let plateWash = "#0546BF", plate = "#070E24", plateEdge = "#1C0F50"
let cyan = "#13D1FB", violet = "#672AFA", magenta = "#B117C5", azure = "#0D7DFA"
let accent4 = "#B096FF", textDim = "#CCD1DC"
let barClaude = ("#FCBE34", "#F23328"), barCodex = ("#84F9D7", "#0292F1"), barThird = ("#CC84FA", "#672AFA")

func color(_ hex: String, _ alpha: CGFloat = 1) -> CGColor {
    var s = hex; s.removeFirst()
    let v = UInt32(s, radix: 16)!
    return CGColor(srgbRed: CGFloat((v >> 16) & 0xff) / 255, green: CGFloat((v >> 8) & 0xff) / 255,
                   blue: CGFloat(v & 0xff) / 255, alpha: alpha)
}

final class Canvas {
    let w: CGFloat, h: CGFloat, rep: NSBitmapImageRep, ctx: CGContext
    init(_ w: Int, _ h: Int) {
        self.w = CGFloat(w); self.h = CGFloat(h)
        rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: w, pixelsHigh: h, bitsPerSample: 8,
                               samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
                               colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
        let gc = NSGraphicsContext(bitmapImageRep: rep)!
        NSGraphicsContext.current = gc
        ctx = gc.cgContext
    }
    /// y-up rect from a top-down description.
    func rect(_ x: CGFloat, _ top: CGFloat, _ width: CGFloat, _ height: CGFloat) -> CGRect {
        CGRect(x: x, y: h - top - height, width: width, height: height)
    }
    func background() {
        // The plate: azure at the top-left, the navy core, violet at the far corner.
        let g = CGGradient(colorsSpace: CGColorSpace(name: CGColorSpace.sRGB),
                           colors: [color(plateWash), color(plate), color(plateEdge)] as CFArray,
                           locations: [0, 0.48, 1])!
        ctx.drawLinearGradient(g, start: CGPoint(x: -w * 0.25, y: h * 1.3), end: CGPoint(x: w * 1.05, y: -h * 0.15), options: [])
        // The rim's light, where it falls on the icon: cyan top-right, magenta bottom-right, azure bottom-left.
        glow(CGPoint(x: w * 0.86, y: h * 0.14), w * 0.34, cyan, 0.30)
        glow(CGPoint(x: w * 0.98, y: h * 0.86), w * 0.26, magenta, 0.28)
        glow(CGPoint(x: w * 0.06, y: h * 0.9), w * 0.28, azure, 0.26)
        // The three bars, as a motif running off the right edge.
        bars()
        // The neon rim along the bottom edge.
        let rim = CGGradient(colorsSpace: CGColorSpace(name: CGColorSpace.sRGB),
                             colors: [color(cyan), color(violet), color(magenta)] as CFArray, locations: [0, 0.55, 1])!
        ctx.saveGState(); ctx.clip(to: rect(0, h - 4, w, 4))
        ctx.drawLinearGradient(rim, start: CGPoint(x: 0, y: 0), end: CGPoint(x: w, y: 0), options: [])
        ctx.restoreGState()
    }
    func glow(_ center: CGPoint, _ radius: CGFloat, _ hex: String, _ alpha: CGFloat) {
        // `center` is given top-down.
        let c = CGPoint(x: center.x, y: h - center.y)
        let g = CGGradient(colorsSpace: CGColorSpace(name: CGColorSpace.sRGB),
                           colors: [color(hex, alpha), color(hex, 0)] as CFArray, locations: [0, 1])!
        ctx.drawRadialGradient(g, startCenter: c, startRadius: 0, endCenter: c, endRadius: radius, options: [])
    }
    func bars() {
        let specs: [(CGFloat, CGFloat, (String, String))] = [(0.86, 0.42, barClaude), (0.92, 0.62, barCodex), (0.98, 0.48, barThird)]
        for (fx, fh, bar) in specs {
            let bw = w * 0.05, bh = h * fh
            let r = rect(w * fx, h - bh + 4, bw, bh)
            let path = CGPath(roundedRect: r, cornerWidth: bw / 2, cornerHeight: bw / 2, transform: nil)
            let g = CGGradient(colorsSpace: CGColorSpace(name: CGColorSpace.sRGB),
                               colors: [color(bar.0, 0.22), color(bar.1, 0.22)] as CFArray, locations: [0, 1])!
            ctx.saveGState(); ctx.addPath(path); ctx.clip()
            ctx.drawLinearGradient(g, start: CGPoint(x: 0, y: r.maxY), end: CGPoint(x: 0, y: r.minY), options: [])
            ctx.restoreGState()
        }
    }
    func text(_ s: String, size: CGFloat, weight: NSFont.Weight, hex: String, x: CGFloat, top: CGFloat, tracking: CGFloat = 0) {
        let attrs: [NSAttributedString.Key: Any] = [
            .font: NSFont.systemFont(ofSize: size, weight: weight),
            .foregroundColor: NSColor(cgColor: color(hex))!,
            .kern: tracking,
        ]
        let a = NSAttributedString(string: s, attributes: attrs)
        let line = CTLineCreateWithAttributedString(a)
        var ascent: CGFloat = 0, descent: CGFloat = 0
        _ = CTLineGetTypographicBounds(line, &ascent, &descent, nil)
        ctx.saveGState()
        ctx.textPosition = CGPoint(x: x, y: h - top - ascent)
        CTLineDraw(line, ctx)
        ctx.restoreGState()
    }
    /// Text filled with the headline's gradient (azure → violet), glyphs as a clip.
    func gradientText(_ s: String, size: CGFloat, weight: NSFont.Weight, x: CGFloat, top: CGFloat, tracking: CGFloat = 0) {
        let font = NSFont.systemFont(ofSize: size, weight: weight)
        let a = NSAttributedString(string: s, attributes: [.font: font, .kern: tracking])
        let line = CTLineCreateWithAttributedString(a)
        var ascent: CGFloat = 0
        let width = CTLineGetTypographicBounds(line, &ascent, nil, nil)
        let origin = CGPoint(x: x, y: h - top - ascent)
        let path = CGMutablePath()
        for run in CTLineGetGlyphRuns(line) as! [CTRun] {
            let runFont = unsafeBitCast(CFDictionaryGetValue(CTRunGetAttributes(run), Unmanaged.passUnretained(kCTFontAttributeName).toOpaque()), to: CTFont.self)
            let n = CTRunGetGlyphCount(run)
            var glyphs = [CGGlyph](repeating: 0, count: n), positions = [CGPoint](repeating: .zero, count: n)
            CTRunGetGlyphs(run, CFRangeMake(0, n), &glyphs); CTRunGetPositions(run, CFRangeMake(0, n), &positions)
            for i in 0..<n {
                if let gp = CTFontCreatePathForGlyph(runFont, glyphs[i], nil) {
                    let t = CGAffineTransform(translationX: origin.x + positions[i].x, y: origin.y + positions[i].y)
                    path.addPath(gp, transform: t)
                }
            }
        }
        let g = CGGradient(colorsSpace: CGColorSpace(name: CGColorSpace.sRGB),
                           colors: [color(azure), color(violet)] as CFArray, locations: [0, 1])!
        ctx.saveGState(); ctx.addPath(path); ctx.clip()
        ctx.drawLinearGradient(g, start: CGPoint(x: x, y: 0), end: CGPoint(x: x + CGFloat(width), y: 0), options: [])
        ctx.restoreGState()
    }
    func image(_ path: URL, x: CGFloat, top: CGFloat, width: CGFloat, shadow: CGFloat = 0) {
        let img = NSImage(contentsOf: path)!
        let height = width * img.size.height / img.size.width
        ctx.saveGState()
        if shadow > 0 { ctx.setShadow(offset: CGSize(width: 0, height: -shadow * 0.4), blur: shadow, color: color("#000000", 0.55)) }
        img.draw(in: rect(x, top, width, height))
        ctx.restoreGState()
    }
    func pill(_ s: String, x: CGFloat, top: CGFloat) -> CGFloat {
        let font = NSFont.systemFont(ofSize: 18, weight: .semibold)
        let a = NSAttributedString(string: s, attributes: [.font: font])
        let tw = CTLineGetTypographicBounds(CTLineCreateWithAttributedString(a), nil, nil, nil)
        let r = rect(x, top, CGFloat(tw) + 36, 40)
        let p = CGPath(roundedRect: r, cornerWidth: 20, cornerHeight: 20, transform: nil)
        ctx.saveGState()
        ctx.addPath(p); ctx.setFillColor(color("#FFFFFF", 0.09)); ctx.fillPath()
        ctx.addPath(p); ctx.setStrokeColor(color("#FFFFFF", 0.16)); ctx.setLineWidth(1); ctx.strokePath()
        ctx.restoreGState()
        text(s, size: 18, weight: .semibold, hex: "#FFFFFF", x: x + 18, top: top + 9)
        return r.width
    }
    func write(_ path: URL) {
        try! rep.representation(using: .png, properties: [:])!.write(to: path)
        print("wrote \(path.path) \(Int(w))x\(Int(h))")
    }
}

let icon = root.appendingPathComponent("public/icon-1024x1024.png")
let menu = root.appendingPathComponent("public/screenshot-menu-dark.png")

// ── Open Graph / Twitter: 1200x630 ──
do {
    let c = Canvas(1200, 630)
    c.background()
    c.image(icon, x: 88, top: 205, width: 200, shadow: 40)
    c.text("Every agent’s quota.", size: 66, weight: .black, hex: "#FFFFFF", x: 340, top: 118, tracking: -2)
    c.text("One glance.", size: 66, weight: .black, hex: "#FFFFFF", x: 340, top: 194, tracking: -2)
    c.gradientText("Costs nothing.", size: 66, weight: .black, x: 340, top: 270, tracking: -2)
    c.text("A native macOS menu-bar monitor", size: 27, weight: .regular, hex: textDim, x: 342, top: 378)
    c.text("for Codex and Claude Code.", size: 27, weight: .regular, hex: textDim, x: 342, top: 414)
    c.text("lancetta.app   •   Free · macOS 15+", size: 21, weight: .semibold, hex: accent4, x: 88, top: 556)
    c.write(root.appendingPathComponent("app/opengraph-image.png"))
    c.write(root.appendingPathComponent("app/twitter-image.png"))
}

// ── GitHub social preview: 1280x640 ──
do {
    let c = Canvas(1280, 640)
    c.background()
    c.image(icon, x: 64, top: 132, width: 108, shadow: 28)
    c.text("Lancetta", size: 78, weight: .black, hex: "#FFFFFF", x: 190, top: 136, tracking: -2)
    c.gradientText("Every agent’s quota. One glance. Costs nothing.", size: 30, weight: .bold, x: 64, top: 282, tracking: -0.5)
    c.text("A native macOS menu-bar monitor for Codex", size: 23, weight: .regular, hex: textDim, x: 64, top: 340)
    c.text("and Claude Code.", size: 23, weight: .regular, hex: textDim, x: 64, top: 371)
    var x: CGFloat = 64
    for label in ["Menu bar", "No tokens spent", "macOS 15+"] { x += c.pill(label, x: x, top: 440) + 12 }
    c.text("lancetta.app", size: 20, weight: .semibold, hex: accent4, x: 64, top: 576)
    c.image(menu, x: 712, top: 92, width: 500, shadow: 48)
    c.write(root.appendingPathComponent(".github/social-preview.png"))
}

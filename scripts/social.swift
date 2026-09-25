import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

// The share images, derived from ONE master: scripts/social-card.png, the
// designed card (2:1, 1774x887) the user supplied on 2026-09-25.
//
//   swift scripts/social.swift <site-root>
//
// Writes app/opengraph-image.jpg (1200x630) and .github/social-preview.jpg
// (1280x640, GitHub's own size, which still has to be uploaded by hand:
// Settings → General → Social preview).
//
// There is no twitter-image file any more, on purpose: with none, Next copies
// the Open Graph image into twitter:image (`inheritFromMetadata` in
// next/dist/lib/metadata/resolve-metadata.js), so X gets the same card and
// there is no second copy to forget. The last pair were byte-identical PNGs.
//
// JPEG, not PNG: the card is gradients and a photograph of a laptop, and the
// PNG it replaced weighed 870 KB at 1200x630. At quality 0.88 this one is a
// few hundred KB less, and link-preview clients are known to drop large ones.
//
// 1200x630 is 1.905:1 against the master's 2:1, so the master is scaled to
// cover and the surplus width is cut a third from the left and two thirds from
// the right: the feature labels sit close to the left edge, and a centred cut
// took the margin they had.
//
// This used to DRAW the cards from the icon and a menu capture. It is still
// committed rather than recreated per session for the reason that version gave:
// the set before it came from a throwaway, and the day it had to change there
// was nothing to re-run.

let root = URL(fileURLWithPath: CommandLine.arguments[1])
let masterURL = root.appendingPathComponent("scripts/social-card.png")

guard let source = CGImageSourceCreateWithURL(masterURL as CFURL, nil),
      let decoded = CGImageSourceCreateImageAtIndex(source, 0, nil)
else { fatalError("cannot read \(masterURL.path)") }

// The master carries no colour profile. Tag it sRGB rather than let the draw
// below convert it from whatever ImageIO assumes for an untagged file.
let sRGB = CGColorSpace(name: CGColorSpace.sRGB)!
let master = decoded.copy(colorSpace: sRGB) ?? decoded

func write(_ path: String, width: Int, height: Int, leftShare: CGFloat) {
    let scale = max(CGFloat(width) / CGFloat(master.width), CGFloat(height) / CGFloat(master.height))
    let drawn = CGSize(width: CGFloat(master.width) * scale, height: CGFloat(master.height) * scale)
    guard let ctx = CGContext(data: nil, width: width, height: height, bitsPerComponent: 8, bytesPerRow: 0,
                              space: sRGB, bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)
    else { fatalError("cannot create a \(width)x\(height) context") }
    ctx.interpolationQuality = .high
    // CoreGraphics is y-up, but the vertical cut is centred, so only x matters.
    ctx.draw(master, in: CGRect(x: -(drawn.width - CGFloat(width)) * leftShare,
                                y: -(drawn.height - CGFloat(height)) / 2,
                                width: drawn.width, height: drawn.height))

    let url = root.appendingPathComponent(path)
    guard let image = ctx.makeImage(),
          let dest = CGImageDestinationCreateWithURL(url as CFURL, UTType.jpeg.identifier as CFString, 1, nil)
    else { fatalError("cannot encode \(path)") }
    let options: [CFString: Any] = [
        kCGImageDestinationLossyCompressionQuality: 0.88,
        kCGImagePropertyJFIFDictionary: [kCGImagePropertyJFIFIsProgressive: true],
    ]
    CGImageDestinationAddImage(dest, image, options as CFDictionary)
    guard CGImageDestinationFinalize(dest) else { fatalError("cannot write \(url.path)") }
    let bytes = (try? FileManager.default.attributesOfItem(atPath: url.path)[.size] as? Int) ?? 0
    print("\(path)  \(width)x\(height)  \(bytes / 1024) KB")
}

write("app/opengraph-image.jpg", width: 1200, height: 630, leftShare: 1.0 / 3.0)
write(".github/social-preview.jpg", width: 1280, height: 640, leftShare: 0.5)

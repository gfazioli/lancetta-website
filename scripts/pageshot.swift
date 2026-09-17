import WebKit
import AppKit

// Snapshot a live page at a given viewport, optionally scrolled, optionally in
// dark mode. Exists so a layout claim about this site is a picture rather than
// a grep: the served HTML proves the markup and is structurally blind to
// opacity, z-index, transforms and font size.
let url = CommandLine.arguments[1], out = CommandLine.arguments[2]
let w = Int(CommandLine.arguments[3])!, h = Int(CommandLine.arguments[4])!
let scrollY = CommandLine.arguments.count > 5 ? Int(CommandLine.arguments[5])! : 0
let light = CommandLine.arguments.count > 6 && CommandLine.arguments[6] == "light"

let app = NSApplication.shared
app.setActivationPolicy(.prohibited)
let cfg = WKWebViewConfiguration()
// EPHEMERAL, always. A persistent store outlives the build being measured: a
// run against a rebuilt site read a JS chunk from cache and reported the OLD
// navbar logo, while curl on the same server showed the new one. Same family
// as a `next start` outliving its bundle, one layer down.
cfg.websiteDataStore = .nonPersistent()
let wv = WKWebView(frame: NSRect(x: 0, y: 0, width: w, height: h), configuration: cfg)
// The webview has to live in a real window: takeSnapshot on a detached view
// answers WKErrorDomain Code=1 "An unknown error occurred", which reads like a
// page fault and is a view-hierarchy one. Offscreen and non-activating, so it
// never steals focus from whatever the user is doing.
let win = NSWindow(contentRect: NSRect(x: 0, y: 0, width: w, height: h),
                   styleMask: [.borderless], backing: .buffered, defer: false)
win.contentView = wv
// ON a display, not at -20000: WebKit suspends rAF and IntersectionObserver for
// a window off every screen, so a hero whose entrance animation is in-view
// triggered stays at opacity 0 for ever. Measured with a positive control —
// the LIVE sibling site read opacity 0 through the same instrument, which is
// how this was caught before "fixing" code that was already correct.
// Nearly transparent and below everything, so it never covers the user's work.
win.alphaValue = 1.0
win.level = NSWindow.Level(rawValue: Int(CGWindowLevelForKey(.desktopWindow)))
win.ignoresMouseEvents = true
win.orderFrontRegardless()
// Light mode is stored, not negotiated: the site pins `defaultColorScheme:
// 'dark'`, so a snapshot of the light tokens has to set the keys Mantine and
// Nextra read and reload once. Without it the light branch of every token in
// theme/global.css is a branch nobody has ever seen render.
if light {
    let src = "try { localStorage.setItem('mantine-color-scheme-value','light'); localStorage.setItem('theme','light'); } catch (e) {}"
    let s = WKUserScript(source: src, injectionTime: .atDocumentStart, forMainFrameOnly: true)
    cfg.userContentController.addUserScript(s)
}
wv.load(URLRequest(url: URL(string: url)!))

final class D: NSObject, WKNavigationDelegate {
    let out: String, w: Int, h: Int, scrollY: Int
    init(_ o: String, _ w: Int, _ h: Int, _ s: Int) { out = o; self.w = w; self.h = h; scrollY = s }
    func webView(_ v: WKWebView, didFinish _: WKNavigation!) {
        // Give the client bundle, the Scene canvases and the fonts time to land:
        // a snapshot taken at didFinish is a picture of the server HTML, which
        // is the very thing this tool exists not to measure.
        DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
            // REVEAL, and it is staging rather than measuring — say so wherever
            // one of these pictures is used. `mantine-text-animate` starts its
            // characters at opacity 0 and advances them on an in-view trigger
            // that never fires in a headless WKWebView. Measured against a
            // positive control: the LIVE sibling site reads opacity 0 through
            // this same instrument, so the zero is the instrument's, not the
            // page's. Everything else in the shot is the real render.
            let reveal = "document.querySelectorAll('h1 span, h2 span').forEach(function(s){ if (getComputedStyle(s).opacity === '0') { s.style.opacity = 1; s.style.transform = 'none'; } });"
            v.evaluateJavaScript(reveal + "window.scrollTo(0, \(self.scrollY)); 'ok'") { _, _ in
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
                    let c = WKSnapshotConfiguration()
                    c.rect = NSRect(x: 0, y: 0, width: self.w, height: self.h)
                    c.snapshotWidth = NSNumber(value: self.w)
                    v.takeSnapshot(with: c) { img, err in
                        guard let img, let t = img.tiffRepresentation,
                              let r = NSBitmapImageRep(data: t),
                              let png = r.representation(using: .png, properties: [:]) else {
                            FileHandle.standardError.write("failed: \(String(describing: err))\n".data(using: .utf8)!)
                            exit(1)
                        }
                        try! png.write(to: URL(fileURLWithPath: self.out))
                        print("wrote \(self.out) \(r.pixelsWide)x\(r.pixelsHigh) at scrollY=\(self.scrollY)")
                        exit(0)
                    }
                }
            }
        }
    }
    func webView(_ v: WKWebView, didFail _: WKNavigation!, withError e: Error) {
        FileHandle.standardError.write("nav failed: \(e)\n".data(using: .utf8)!); exit(2)
    }
    func webView(_ v: WKWebView, didFailProvisionalNavigation _: WKNavigation!, withError e: Error) {
        FileHandle.standardError.write("provisional nav failed: \(e)\n".data(using: .utf8)!); exit(2)
    }
}
let d = D(out, w, h, scrollY); wv.navigationDelegate = d
RunLoop.main.run(until: .distantFuture)

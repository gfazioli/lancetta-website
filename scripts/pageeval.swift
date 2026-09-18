import WebKit
import AppKit
// Run JS in a live page and print the result. Optionally scrolled first, so a
// scroll-driven state — the pinned gallery's frame, the product bar's current
// link — can be read from the DOM rather than guessed from a picture: this
// view's snapshot paints LAG its DOM, and its animation clock never advances,
// so a picture of a scroll-driven page is evidence about the instrument.
//   pageeval <url> <js> [scrollY] [width] [height]
let url = CommandLine.arguments[1], js = CommandLine.arguments[2]
let scrollY = CommandLine.arguments.count > 3 ? Int(CommandLine.arguments[3])! : 0
let w = CommandLine.arguments.count > 4 ? Int(CommandLine.arguments[4])! : 1280
let h = CommandLine.arguments.count > 5 ? Int(CommandLine.arguments[5])! : 1100
let app = NSApplication.shared
app.setActivationPolicy(.prohibited)
let cfg = WKWebViewConfiguration()
cfg.websiteDataStore = .nonPersistent()   // see pageshot.swift: a cached chunk reported a stale build
let wv = WKWebView(frame: NSRect(x: 0, y: 0, width: w, height: h), configuration: cfg)
let win = NSWindow(contentRect: NSRect(x: 0, y: 0, width: w, height: h),
                   styleMask: [.borderless], backing: .buffered, defer: false)
win.contentView = wv
win.alphaValue = 1.0
win.level = NSWindow.Level(rawValue: Int(CGWindowLevelForKey(.desktopWindow)))
win.ignoresMouseEvents = true
win.orderFrontRegardless()
wv.load(URLRequest(url: URL(string: url)!))
final class D: NSObject, WKNavigationDelegate {
    let js: String, scrollY: Int
    init(_ j: String, _ s: Int) { js = j; scrollY = s }
    func run(_ v: WKWebView) {
        v.evaluateJavaScript(js) { r, e in
            if let e { print("ERR: \(e)") } else { print(String(describing: r ?? "nil")) }
            exit(0)
        }
    }
    func webView(_ v: WKWebView, didFinish _: WKNavigation!) {
        DispatchQueue.main.asyncAfter(deadline: .now() + 4.0) {
            guard self.scrollY > 0 else { return self.run(v) }
            // `behavior: 'instant'`, and it is not a preference: the site sets
            // `html { scroll-behavior: smooth }`, and a smooth scroll is an
            // animation — in this view the animation clock never advances, so
            // a plain scrollTo(0, y) leaves scrollY at 0 for ever (measured:
            // 0 after 1.2 s, against 1500 immediately with 'instant').
            //
            // The `scroll` EVENT is dispatched by hand for the same reason: a
            // browser fires it from its rendering loop, and this view's does
            // not turn — measured at scrollY 3000 with the pinned gallery
            // still on frame 0 and the product bar still on "Overview" after
            // 1.2 s, while a replica of the bar's own arithmetic, run in the
            // page, picked the right section. So what this measures is the
            // listeners' arithmetic and the state they leave in the DOM; that
            // a real browser delivers the event is the browser's job.
            let scroll = "window.scrollTo({ top: \(self.scrollY), behavior: 'instant' }); window.dispatchEvent(new Event('scroll')); 'ok'"
            v.evaluateJavaScript(scroll) { _, _ in
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) { self.run(v) }
            }
        }
    }
}
let d = D(js, scrollY); wv.navigationDelegate = d
RunLoop.main.run(until: .distantFuture)

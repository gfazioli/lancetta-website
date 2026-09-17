import WebKit
import AppKit
let url = CommandLine.arguments[1], js = CommandLine.arguments[2]
let app = NSApplication.shared
app.setActivationPolicy(.prohibited)
let cfg = WKWebViewConfiguration()
cfg.websiteDataStore = .nonPersistent()   // see pageshot.swift: a cached chunk reported a stale build
let wv = WKWebView(frame: NSRect(x: 0, y: 0, width: 1280, height: 1100), configuration: cfg)
let win = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 1280, height: 1100),
                   styleMask: [.borderless], backing: .buffered, defer: false)
win.contentView = wv
win.alphaValue = 1.0
win.level = NSWindow.Level(rawValue: Int(CGWindowLevelForKey(.desktopWindow)))
win.ignoresMouseEvents = true
win.orderFrontRegardless()
wv.load(URLRequest(url: URL(string: url)!))
final class D: NSObject, WKNavigationDelegate {
    let js: String
    init(_ j: String) { js = j }
    func webView(_ v: WKWebView, didFinish _: WKNavigation!) {
        DispatchQueue.main.asyncAfter(deadline: .now() + 4.0) {
            v.evaluateJavaScript(self.js) { r, e in
                if let e { print("ERR: \(e)") } else { print(String(describing: r ?? "nil")) }
                exit(0)
            }
        }
    }
}
let d = D(js); wv.navigationDelegate = d
RunLoop.main.run(until: .distantFuture)

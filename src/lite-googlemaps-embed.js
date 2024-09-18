
// todo: tabbability?

// Most of the impl was stolen from paulirish/lite-youtube-embed
class LiteGMEmbed extends HTMLElement {
  connectedCallback() {
    this.staticImg = this.querySelector('img');
    console.assert(this.staticImg && this.staticImg.parentNode === this);

    // Warm up the TCP connections we're (likely) about to use.
    LiteGMEmbed.warmConnections();

    // On hover (or tap), load the real iframe
    this.addEventListener('pointerover', _ => this.addIframe(), {once: true});
  }

  /**
   * Begin pre-connecting to warm up the iframe load
   * Since the embed's network requests load within its iframe,
   *   preload/prefetch'ing them outside the iframe will only cause double-downloads.
   * So, the best we can do is warm up a few connections to origins that are in the critical path.
   */
  static warmConnections() {
    for (const domain of ['https://maps.googleapis.com', 'https://www.google.com', 'https://maps.gstatic.com']) {
      const linkEl = document.createElement('link');
      linkEl.rel = 'preconnect';
      linkEl.href = domain;
      document.head.append(linkEl);
    }
  }

  addIframe() {
    const img = this.staticImg;
    const iframe = document.createElement('iframe');
    this.iframe = iframe;
    iframe.loading = 'lazy';
    iframe.allowFullscreen = true;

    // TODO, make dynamic based on the static image.

    // embed supports `place`, `view`, `directions`, `streetview` and `search`. https://developers.google.com/maps/documentation/embed/embedding-map#choosing_map_modes
    // But static only supports a `view`-like combo of center & zoom. https://developers.google.com/maps/documentation/maps-static/start?hl=en_US#URL_Parameters

    // Meanwhile StaticMapService.GetMapImage seems PERFECT and the images match
    iframe.src = `https://www.google.com/maps/embed/v1/view?zoom=12&center=37.3861,-122.0839&key=AIzaSyDvxxKvshRHZOnEaUGb_V9t3aIjOUVIDWw`;

    performance.mark('iframestart');
    img.parentNode.insertBefore(iframe, img.nextSibling);

    // Set focus for a11y
    iframe.focus();
    iframe.onload = _ => this.iframeLoaded();
  }

  // Onload fires earlier than when its visually done.
  iframeLoaded() {
    // So we'll just visually put the iframe directly on top of the static image
    this.classList.add('lgm-activated');

    performance.mark('iframeend'); performance.measure('iframe', 'iframestart', 'iframeend');
  }
}

customElements.define('lite-googlemaps', LiteGMEmbed);


export default function FooterFanpage() {
    return (
      <div>
        <h3 className="text-lg font-semibold text-white">
          Fanpage Facebook
        </h3>
  
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 shadow-lg">
          <iframe
            title="Facebook Fanpage"
            src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FYOUR_PAGE&tabs=timeline&width=500&height=300&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId="
            width="100%"
            height="300"
            style={{ border: "none", overflow: "hidden" }}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            loading="lazy"
          />
        </div>
      </div>
    );
  }
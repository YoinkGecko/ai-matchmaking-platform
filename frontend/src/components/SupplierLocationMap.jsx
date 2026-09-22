import { buildMapEmbedUrl, buildMapOpenUrl } from "../utils/maps";

export default function SupplierLocationMap({ title, address }) {
  const embedUrl = buildMapEmbedUrl(address);
  const openUrl = buildMapOpenUrl(address);

  if (!address?.trim()) {
    return (
      <p className="card__meta supplier-map__empty">Location not provided by supplier.</p>
    );
  }

  return (
    <div className="supplier-map stack">
      {title && <p className="supplier-map__label">{title}</p>}
      <p className="card__meta">{address}</p>
      {embedUrl && (
        <div className="supplier-map__frame-wrap">
          <iframe
            title={`Map: ${address}`}
            className="supplier-map__frame"
            src={embedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
      {openUrl && (
        <a
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--secondary supplier-map__open"
        >
          Open in Google Maps
        </a>
      )}
    </div>
  );
}

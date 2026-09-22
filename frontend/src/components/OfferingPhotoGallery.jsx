import { getOfferingPhotoUrls } from "../utils/offeringPhotos";

function NoImagePlaceholder({ variant }) {
  if (variant === "drawer") {
    return (
      <div className="offering-photos__empty offering-photos__empty--drawer">
        No image available
      </div>
    );
  }

  return (
    <div
      className="offering-photos offering-photos--card offering-photos--empty"
      aria-label="No image available"
    >
      <span className="offering-photos__empty-text">No image available</span>
    </div>
  );
}

export default function OfferingPhotoGallery({ record, variant = "card" }) {
  const urls = getOfferingPhotoUrls(record);

  if (!urls.length) {
    return <NoImagePlaceholder variant={variant} />;
  }

  if (variant === "drawer") {
    return (
      <div className="offering-photos offering-photos--drawer">
        {urls.map((src) => (
          <a
            key={src}
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="offering-photos__item"
          >
            <img src={src} alt="Supplier offering photo" loading="lazy" />
          </a>
        ))}
      </div>
    );
  }

  const cover = urls[0];
  return (
    <div className="offering-photos offering-photos--card">
      <img src={cover} alt="Supplier offering" loading="lazy" />
      {urls.length > 1 && (
        <span className="offering-photos__count">+{urls.length - 1}</span>
      )}
    </div>
  );
}

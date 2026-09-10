"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent } from "react";
import styles from "./ProjectGallery.module.css";

const PHOTOS = [
  {
    src: "/assets/gallery/headworks-concept.webp",
    title: "Where the journey begins",
    category: "Headworks & river valley",
    caption: "Water, landscape and the first step in the generation journey.",
    alt: "Illustrative view of a low concrete diversion weir on a rocky river between wooded Nepal hills.",
  },
  {
    src: "/assets/gallery/penstock-concept.webp",
    title: "Following the flow",
    category: "Penstock",
    caption: "A closer look at the infrastructure connecting river and powerhouse.",
    alt: "Illustrative view of a steel penstock descending a green hillside on concrete supports.",
  },
  {
    src: "/assets/gallery/powerhouse-concept.webp",
    title: "The heart of generation",
    category: "Inside the powerhouse",
    caption: "Engineering that brings the energy of moving water to life.",
    alt: "Illustrative view of teal hydro generators and yellow safety rails inside a daylit turbine hall.",
  },
] as const;

function ExpandIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4" />
    </svg>
  );
}

export function ProjectGallery() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const activePhoto = PHOTOS[activeIndex];

  function openPhoto(index: number) {
    setActiveIndex(index);
    setIsOpen(true);
    dialogRef.current?.showModal();
    closeRef.current?.focus();
  }

  function closePhoto() {
    dialogRef.current?.close();
  }

  function movePhoto(direction: number) {
    setActiveIndex((current) => (current + direction + PHOTOS.length) % PHOTOS.length);
  }

  function onDialogKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      movePhoto(event.key === "ArrowLeft" ? -1 : 1);
    }
  }

  return (
    <section id="gallery" aria-labelledby="gallery-heading" className={`section container scroll-mt-16 ${styles.gallery}`}>
      <div className={styles.heading}>
        <div>
          <p className="eyebrow text-[var(--forest-600)]">Landscape / Infrastructure / Energy</p>
          <h2 id="gallery-heading" tabIndex={-1} className="h2 mt-3 scroll-mt-24 outline-none">Project gallery</h2>
        </div>
        <p className={styles.intro}>From the river valley to the turbine hall.<br />A perspective on the journey of hydropower.</p>
      </div>

      <div className={styles.grid}>
        {PHOTOS.map((photo, index) => (
          <figure key={photo.src} className={`${styles.figure} ${index === 0 ? styles.featured : ""}`}>
            <button type="button" className={styles.imageButton} onClick={() => openPhoto(index)} aria-label={`Enlarge image: ${photo.category}`}>
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes={index === 0 ? "(max-width: 1216px) 92vw, 1120px" : "(max-width: 640px) 92vw, (max-width: 1216px) 45vw, 550px"}
                className={styles.image}
              />
              <span className={styles.photoNumber} aria-hidden="true">0{index + 1}</span>
              <span className={styles.expand} aria-hidden="true"><ExpandIcon /><span>View image</span></span>
              {index === 0 ? <span className={styles.featureLabel} aria-hidden="true">The landscape behind the energy</span> : null}
            </button>
            <figcaption className={styles.caption}>
              <div>
                <p className={styles.category}>{photo.category}</p>
                <h3 className={styles.title}>{photo.title}</h3>
              </div>
              <p className={styles.description}>{photo.caption}</p>
            </figcaption>
          </figure>
        ))}
      </div>

      <p className={styles.note}><span aria-hidden="true" />Illustrative imagery for this website concept.</p>

      <dialog
        ref={dialogRef}
        aria-labelledby="gallery-dialog-title"
        aria-describedby="gallery-dialog-note"
        className={styles.dialog}
        onClose={() => setIsOpen(false)}
        onKeyDown={onDialogKeyDown}
        onClick={(event) => { if (event.target === event.currentTarget) closePhoto(); }}
      >
        <div className={styles.lightbox}>
          <button ref={closeRef} type="button" className={styles.close} onClick={closePhoto} aria-label="Close image viewer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg>
          </button>
          <div className={styles.lightboxImage}>
            {isOpen ? <Image src={activePhoto.src} alt={activePhoto.alt} fill sizes="(max-width: 1216px) 94vw, 1120px" className={styles.fullImage} loading="eager" /> : null}
          </div>
          <div className={styles.lightboxFooter}>
            <div aria-live="polite">
              <p className={styles.category}>{activePhoto.category}</p>
              <h3 id="gallery-dialog-title" className={styles.lightboxTitle}>{activePhoto.title}</h3>
            </div>
            <div className={styles.navigation}>
              <button type="button" onClick={() => movePhoto(-1)} aria-label="Previous image">&#8592;</button>
              <span aria-label={`Image ${activeIndex + 1} of ${PHOTOS.length}`}>0{activeIndex + 1}<span aria-hidden="true"> / 03</span></span>
              <button type="button" onClick={() => movePhoto(1)} aria-label="Next image">&#8594;</button>
            </div>
          </div>
          <p id="gallery-dialog-note" className={styles.lightboxNote}>Illustrative imagery for this website concept.</p>
        </div>
      </dialog>
    </section>
  );
}

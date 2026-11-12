import { useState } from 'react'
import { useStorageUrl } from '../../../shared/hooks/useStorageUrl'
import { useT } from '../../../shared/i18n/useT'
import { ImageViewer } from '../../../shared/ui/ImageViewer'
import type { Dive, LogbookImage } from '../types'
import styles from './LogbookPageCard.module.css'

/**
 * Dokumentation for dykket: logbogsside, dykkercentrets stempel,
 * dykkercomputerens skærm … Tryk på et billede for fuld skærm.
 */
export function LogbookPageCard({ dive }: { dive: Dive }) {
  const { t } = useT()
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const images = dive.logbookImages
  if (images.length === 0) return null
  const open = openIndex !== null ? images[openIndex] : undefined
  const title = (index: number) =>
    images.length > 1
      ? `${t('dives.logbookPage')} · ${t('dives.logbookImageOf', { n: index + 1, total: images.length })}`
      : t('dives.logbookPage')

  return (
    <section className={styles.card}>
      <h2 className={styles.heading}>📖 {t('dives.logbookPage')}</h2>
      <div className={images.length > 1 ? styles.grid : undefined}>
        {images.map((image, index) => (
          <Thumb
            key={image.path}
            image={image}
            alt={title(index)}
            several={images.length > 1}
            onOpen={() => setOpenIndex(index)}
          />
        ))}
      </div>
      {open && openIndex !== null && (
        <ImageViewer
          title={title(openIndex)}
          storagePath={open.path}
          previewPath={open.smallPath}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </section>
  )
}

function Thumb({
  image,
  alt,
  several,
  onOpen,
}: {
  image: LogbookImage
  alt: string
  several: boolean
  onOpen: () => void
}) {
  const { t } = useT()
  // Den lille version ligger på telefonen og kan vises uden dækning.
  const url = useStorageUrl(image.smallPath)
  return (
    <button type="button" className={styles.thumbButton} onClick={onOpen}>
      {url ? (
        <img className={several ? styles.thumbSmall : styles.thumb} src={url} alt={alt} />
      ) : (
        <span className={styles.placeholder}>{t('common.loading')}</span>
      )}
    </button>
  )
}

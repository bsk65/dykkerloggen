import { useRef, useState } from 'react'
import { loadImageBlob } from '../../../../shared/api/offlineFiles'
import { useObjectUrl } from '../../../../shared/hooks/useObjectUrl'
import { useStorageUrl } from '../../../../shared/hooks/useStorageUrl'
import { useT } from '../../../../shared/i18n/useT'
import { Button } from '../../../../shared/ui/Button'
import { rotateImage } from '../../../../shared/utils/rotateImage'
import { MAX_LOGBOOK_IMAGES, type LogbookItem } from '../../logic/logbookPages'
import type { LogbookImage } from '../../types'
import styles from './LogbookImagesField.module.css'

let nextKey = 0
function newItem(file: File): LogbookItem {
  nextKey += 1
  return { kind: 'new', key: `new-${nextKey}`, file }
}

/** Det gemte billede i fuld størrelse — eller den lille version uden dækning. */
async function loadSaved(image: LogbookImage): Promise<Blob> {
  try {
    return await loadImageBlob(image.path)
  } catch {
    return loadImageBlob(image.smallPath)
  }
}

type Props = {
  label: string
  hint: string
  items: LogbookItem[]
  onChange: (items: LogbookItem[]) => void
}

/**
 * Flere billeder af dykket: logbogsside, dykkercentrets stempel,
 * dykkercomputerens skærm … Hvert billede kan drejes eller fjernes.
 * Ændringerne gemmes først ved Gem.
 */
export function LogbookImagesField({ label, hint, items, onChange }: Props) {
  const { t } = useT()
  const inputRef = useRef<HTMLInputElement>(null)
  const room = MAX_LOGBOOK_IMAGES - items.length

  function replace(key: string, item: LogbookItem) {
    onChange(items.map((i) => (i.key === key ? item : i)))
  }

  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <span className={styles.hint}>{hint}</span>
      {items.length > 0 && (
        <ul className={styles.list}>
          {items.map((item) => (
            <ItemRow
              key={item.key}
              item={item}
              label={label}
              onReplace={(file) => replace(item.key, newItem(file))}
              onRemove={() => onChange(items.filter((i) => i.key !== item.key))}
            />
          ))}
        </ul>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className={styles.hiddenInput}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []).slice(0, Math.max(0, room))
          if (files.length > 0) onChange([...items, ...files.map(newItem)])
          e.target.value = ''
        }}
      />
      {room > 0 ? (
        <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
          {items.length > 0 ? t('dives.logbookAddMore') : t('dives.logbookAdd')}
        </Button>
      ) : (
        <span className={styles.hint}>{t('dives.logbookMax', { n: MAX_LOGBOOK_IMAGES })}</span>
      )}
    </div>
  )
}

function ItemRow({
  item,
  label,
  onReplace,
  onRemove,
}: {
  item: LogbookItem
  label: string
  onReplace: (file: File) => void
  onRemove: () => void
}) {
  const { t } = useT()
  const [rotating, setRotating] = useState(false)
  const localUrl = useObjectUrl(item.kind === 'new' ? item.file : null)
  const savedUrl = useStorageUrl(item.kind === 'saved' ? item.image.smallPath : null)
  const url = localUrl ?? savedUrl

  async function rotate(direction: 'clockwise' | 'counterclockwise') {
    setRotating(true)
    try {
      const source = item.kind === 'new' ? item.file : await loadSaved(item.image)
      const rotated = await rotateImage(source, direction)
      onReplace(new File([rotated], 'drejet.jpg', { type: 'image/jpeg' }))
    } catch {
      // Billedet kunne ikke hentes (ingen dækning) — det forbliver som det var.
    } finally {
      setRotating(false)
    }
  }

  return (
    <li className={styles.item}>
      {url ? (
        <img className={styles.thumb} src={url} alt={label} />
      ) : (
        <span className={styles.thumb} />
      )}
      <div className={styles.actions}>
        {(['counterclockwise', 'clockwise'] as const).map((direction) => (
          <Button
            key={direction}
            type="button"
            variant="secondary"
            className={styles.iconButton}
            onClick={() => void rotate(direction)}
            disabled={rotating}
            aria-label={t(direction === 'clockwise' ? 'common.rotateRight' : 'common.rotateLeft')}
            title={t(direction === 'clockwise' ? 'common.rotateRight' : 'common.rotateLeft')}
          >
            {direction === 'clockwise' ? '↻' : '↺'}
          </Button>
        ))}
        <Button
          type="button"
          variant="secondary"
          className={styles.iconButton}
          onClick={onRemove}
          aria-label={t('common.removeImage')}
          title={t('common.removeImage')}
        >
          ✕
        </Button>
      </div>
    </li>
  )
}

import { useStorageUrl } from '../../../shared/hooks/useStorageUrl'
import type { LogbookScan } from '../types'
import styles from './LogbookThumb.module.css'

export function LogbookThumb({ scan, onOpen }: { scan: LogbookScan; onOpen: () => void }) {
  // Miniaturen bruger den lille version — den ligger på telefonen.
  const url = useStorageUrl(scan.smallPath ?? scan.storagePath)
  return (
    <button type="button" className={styles.thumb} onClick={onOpen}>
      {url ? (
        <img className={styles.image} src={url} alt={scan.caption} loading="lazy" />
      ) : (
        <span className={styles.placeholder} />
      )}
      {scan.caption && <span className={styles.caption}>{scan.caption}</span>}
    </button>
  )
}

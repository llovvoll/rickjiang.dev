import { useEffect, useState } from 'react'
import UpArrow from '@/data/upwards-arrow.svg'

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 500) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }
    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  return (
    <div className="fixed right-1 md:right-10 bottom-10 opacity-30 hover:opacity-100">
      {isVisible && (
        <button onClick={scrollToTop}>
          <UpArrow className="fill-current dark:text-gray-100" />
        </button>
      )}
    </div>
  )
}

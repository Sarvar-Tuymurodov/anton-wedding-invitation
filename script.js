/* Антон & Регина — 21.08.2026 — GSAP animations */

gsap.registerPlugin(ScrollTrigger)

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------- helpers ---------- */

function splitChars(el) {
  const text = el.textContent
  el.textContent = ''
  el.setAttribute('aria-label', text)
  const chars = []
  for (const ch of text) {
    const span = document.createElement('span')
    span.className = 'char'
    span.setAttribute('aria-hidden', 'true')
    span.textContent = ch === ' ' ? ' ' : ch
    el.appendChild(span)
    chars.push(span)
  }
  return chars
}

function prepareStrokeDraw(path) {
  const len = path.getTotalLength()
  gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
  return len
}

/* ---------- reduced motion: show everything, skip the show ---------- */

if (reducedMotion) {
  document.getElementById('preloader')?.remove()
} else {
  initAnimations()
}

initCountdown()
initMusic()

/* ============================================================
   ANIMATIONS
   ============================================================ */

function initAnimations() {
  /* ----- lock scrolling until the intro finishes ----- */

  history.scrollRestoration = 'manual'
  window.scrollTo(0, 0)
  const lockEl = document.documentElement
  lockEl.classList.add('is-locked')
  const unlockScroll = () => lockEl.classList.remove('is-locked')
  setTimeout(unlockScroll, 10000) // safety net if anything stalls

  /* ----- hero intro timeline (runs after preloader) ----- */

  const heroChars = []
  document.querySelectorAll('[data-split]').forEach((el) => heroChars.push(...splitChars(el)))

  const archPaths = document.querySelectorAll('.hero__arch-path')
  archPaths.forEach(prepareStrokeDraw)

  gsap.set('[data-hero]', { autoAlpha: 0, y: 24 })
  gsap.set(heroChars, { autoAlpha: 0, y: 30, rotate: 8 })

  const intro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })

  intro
    .to(archPaths, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: 0.15 })
    .to('.hero__kicker', { autoAlpha: 1, y: 0, duration: 0.7 }, '-=0.9')
    .to(heroChars, { autoAlpha: 1, y: 0, rotate: 0, duration: 0.7, stagger: 0.045, ease: 'back.out(2)' }, '-=0.4')
    .to('.hero__amp', { autoAlpha: 1, y: 0, duration: 0.5, ease: 'back.out(3)' }, '-=0.6')
    .to('.hero__rule', { autoAlpha: 1, y: 0, duration: 0.6 }, '-=0.3')
    .fromTo('.hero__rule i', { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power2.out' }, '<')
    .to('.hero__date', { autoAlpha: 1, y: 0, duration: 0.6 }, '-=0.4')
    .to('.hero__city', { autoAlpha: 1, y: 0, duration: 0.6 }, '-=0.4')
    .to('.hero__scroll', { autoAlpha: 1, y: 0, duration: 0.8 }, '-=0.2')
    .call(unlockScroll, [], '-=0.6')

  /* ----- preloader ----- */

  const preloader = document.getElementById('preloader')
  const pre = gsap.timeline({
    onComplete: () => {
      preloader.remove()
      intro.play()
    },
  })

  pre
    .from('.preloader__monogram', { autoAlpha: 0, y: 20, duration: 0.8, ease: 'power3.out' })
    .from('.preloader__date', { autoAlpha: 0, letterSpacing: '0.8em', duration: 0.8, ease: 'power3.out' }, '-=0.4')
    .to('.preloader__heart', { scale: 1.35, duration: 0.3, yoyo: true, repeat: 3, ease: 'power1.inOut' }, '-=0.2')
    .to(preloader, { yPercent: -100, duration: 0.9, ease: 'power3.inOut', delay: 0.2 })

  /* ----- floating leaves + petals in hero ----- */

  const leavesBox = document.querySelector('.hero__leaves')
  const LEAF_SVG =
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 C18 6 20 12 12 22 C4 12 6 6 12 2Z" opacity=".85"/></svg>'
  const leaves = []

  for (let i = 0; i < 14; i++) {
    const leaf = document.createElement('span')
    leaf.className = 'leaf' + (i % 3 === 0 ? ' leaf--coral' : '')
    leaf.innerHTML = LEAF_SVG
    const size = gsap.utils.random(10, 26)
    gsap.set(leaf, {
      width: size,
      height: size,
      left: gsap.utils.random(2, 96) + '%',
      top: gsap.utils.random(2, 92) + '%',
      rotate: gsap.utils.random(0, 360),
      opacity: gsap.utils.random(0.2, 0.55),
    })
    leavesBox.appendChild(leaf)
    leaves.push(leaf)

    gsap.to(leaf, {
      y: gsap.utils.random(-40, 40),
      x: gsap.utils.random(-30, 30),
      rotate: '+=' + gsap.utils.random(-90, 90),
      duration: gsap.utils.random(4, 8),
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: gsap.utils.random(0, 3),
    })
  }

  /* mouse parallax on hero */
  const hero = document.querySelector('.hero')
  hero.addEventListener('pointermove', (e) => {
    const dx = (e.clientX / window.innerWidth - 0.5) * 2
    const dy = (e.clientY / window.innerHeight - 0.5) * 2
    gsap.to('.hero__arch', { x: dx * 10, y: dy * 8, duration: 1, ease: 'power2.out' })
    gsap.to(leaves, { xPercent: dx * 18, yPercent: dy * 14, duration: 1.4, ease: 'power2.out' })
  })

  /* scroll hint pulse */
  gsap.to('.hero__scroll-line', {
    scaleY: 0.35,
    transformOrigin: 'top',
    duration: 0.9,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
    delay: 3,
  })

  /* ----- doves fly up when leaving the hero ----- */

  const dovesLayer = document.createElement('div')
  dovesLayer.className = 'doves'
  dovesLayer.setAttribute('aria-hidden', 'true')
  document.body.appendChild(dovesLayer)

  const DOVE_SVG = `
    <svg viewBox="0 0 120 100">
      <path class="dove__wing-far" d="M56 38 Q42 26 32 8 Q46 14 56 28 Q60 34 56 38Z" />
      <path class="dove__body" d="M86 26 Q72 28 60 34 Q44 42 32 52 L8 60 L15 65 L6 72 Q20 72 30 62 Q42 66 54 64 Q70 60 77 48 Q80 42 85 40 Q92 41 95 36 L102 33 L95 30 Q93 23 86 24 Q83 24 86 26Z" />
      <circle class="dove__eye" cx="90" cy="31" r="1.5" />
      <g class="dove__wing-near-g">
        <path class="dove__wing-near" d="M60 36 C50 28 46 14 52 2 C56 8 58 12 59 17 L66 6 C66 14 65 19 63 24 L74 16 C70 26 66 32 60 36Z" />
      </g>
    </svg>`

  function releaseDoves(count) {
    const vh = window.innerHeight
    for (let i = 0; i < count; i++) {
      const dove = document.createElement('div')
      dove.className = 'dove'
      dove.innerHTML = DOVE_SVG
      const size = gsap.utils.random(44, 86)
      const flip = Math.random() < 0.4 ? -1 : 1
      gsap.set(dove, {
        width: size,
        height: size * 0.85,
        left: gsap.utils.random(4, 88) + '%',
        top: '100%',
        autoAlpha: 0,
        scaleX: flip,
      })
      dovesLayer.appendChild(dove)

      /* wing flap — near and far wings in counter-phase, body bobs on the inner svg */
      const near = dove.querySelector('.dove__wing-near-g')
      const far = dove.querySelector('.dove__wing-far')
      gsap.set([near, far], { svgOrigin: '60 36' })
      const flapSpeed = gsap.utils.random(0.2, 0.28)
      const flap = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut', duration: flapSpeed } })
      flap
        .fromTo(near, { rotation: 24 }, { rotation: -30 }, 0)
        .fromTo(far, { rotation: -34 }, { rotation: 22 }, 0.03)
      const bob = gsap.to(dove.querySelector('svg'), {
        y: -6,
        duration: flapSpeed,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      /* wavy ascent — sine sway with banking */
      const dur = gsap.utils.random(2.6, 4.4)
      const dist = vh + size * 2
      const drift = flip * gsap.utils.random(40, 150)
      const amp = gsap.utils.random(24, 60)
      const sways = gsap.utils.random(1.6, 2.6)
      const state = { p: 0 }
      gsap
        .timeline({
          delay: gsap.utils.random(0, 2.2),
          onComplete: () => {
            flap.kill()
            bob.kill()
            dove.remove()
          },
        })
        .to(dove, { autoAlpha: gsap.utils.random(0.8, 1), duration: 0.4 }, 0)
        .to(
          state,
          {
            p: 1,
            duration: dur,
            ease: 'power1.in',
            onUpdate: () => {
              const p = state.p
              gsap.set(dove, {
                y: -p * dist,
                x: drift * p + amp * Math.sin(p * Math.PI * sways),
                rotation: flip * Math.cos(p * Math.PI * sways) * 9,
              })
            },
          },
          0
        )
        .to(dove, { autoAlpha: 0, duration: 0.8 }, dur - 0.8)
    }
  }

  const flockSize = () => (window.innerWidth < 640 ? 9 : 14)

  let lastFlock = 0
  ScrollTrigger.create({
    trigger: '#invite',
    start: 'top 98%',
    onEnter: () => {
      if (Date.now() - lastFlock < 12000) return
      lastFlock = Date.now()
      releaseDoves(flockSize())
    },
  })

  /* a small farewell flock at the finale */
  let lastFinaleFlock = 0
  ScrollTrigger.create({
    trigger: '#finale',
    start: 'top 75%',
    onEnter: () => {
      if (Date.now() - lastFinaleFlock < 20000) return
      lastFinaleFlock = Date.now()
      releaseDoves(Math.round(flockSize() / 2))
    },
  })

  /* ----- generic reveals ----- */

  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      autoAlpha: 0,
      y: 40,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
    })
  })

  gsap.utils.toArray('[data-reveal-group]').forEach((group) => {
    gsap.from(group.children, {
      autoAlpha: 0,
      y: 34,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: { trigger: group, start: 'top 85%', toggleActions: 'play none none reverse' },
    })
  })

  /* ----- car drive ----- */

  const car = document.querySelector('.drive__car')
  const drive = document.querySelector('.drive')

  gsap.fromTo(
    car,
    { x: () => -car.offsetWidth - 60 },
    {
      x: () => window.innerWidth + 60,
      ease: 'none',
      scrollTrigger: {
        trigger: drive,
        start: 'top 95%',
        end: 'bottom 5%',
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    }
  )

  /* bounce + wiggle while driving */
  gsap.to(car, { y: -6, duration: 0.35, repeat: -1, yoyo: true, ease: 'sine.inOut' })
  gsap.to(car, { rotate: 1.2, duration: 0.7, repeat: -1, yoyo: true, ease: 'sine.inOut' })

  /* hearts pop along the road */
  gsap.utils.toArray('.drive__hearts span').forEach((heart, i) => {
    gsap.fromTo(
      heart,
      { autoAlpha: 0, y: 20, scale: 0.4 },
      {
        autoAlpha: 1,
        y: -50,
        scale: 1,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: drive,
          start: `${15 + i * 15}% 90%`,
          end: `${40 + i * 15}% 40%`,
          scrub: true,
        },
      }
    )
  })

  /* ----- date "21" + sprigs + calendar circle ----- */

  gsap.fromTo(
    '#date-num',
    { scale: 0.2, autoAlpha: 0 },
    {
      scale: 1,
      autoAlpha: 1,
      duration: 1.1,
      ease: 'elastic.out(1, 0.45)',
      scrollTrigger: { trigger: '.date__big', start: 'top 85%' },
    }
  )

  document.querySelectorAll('.sprig').forEach((sprig) => {
    const stem = sprig.querySelector('.sprig__stem')
    prepareStrokeDraw(stem)
    const leavesEls = sprig.querySelectorAll('.sprig__leaf')
    gsap.set(leavesEls, { autoAlpha: 0, scale: 0, transformOrigin: 'center' })

    const tl = gsap.timeline({
      scrollTrigger: { trigger: '.date__big', start: 'top 82%' },
    })
    tl.to(stem, { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut' }).to(
      leavesEls,
      { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.09, ease: 'back.out(2.5)' },
      '-=0.5'
    )
  })

  /* calendar days cascade */
  gsap.from('#calendar-days span', {
    autoAlpha: 0,
    scale: 0.5,
    duration: 0.4,
    stagger: { each: 0.018, from: 'start' },
    ease: 'back.out(1.8)',
    scrollTrigger: { trigger: '.calendar', start: 'top 80%' },
  })

  /* hand-drawn circle around the 21st + heart */
  const circle = document.getElementById('circle-path')
  prepareStrokeDraw(circle)

  gsap
    .timeline({ scrollTrigger: { trigger: '.calendar', start: 'top 65%' } })
    .to(circle, { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut', delay: 0.6 })
    .from('.calendar__heart', { autoAlpha: 0, scale: 0, y: 8, duration: 0.5, ease: 'back.out(3)' })
    .to('.calendar__heart', { scale: 1.25, duration: 0.4, repeat: -1, yoyo: true, ease: 'sine.inOut' })

  /* ----- finale: signature written letter by letter + floating hearts ----- */

  const signature = document.querySelector('[data-split-script]')
  const sigChars = splitChars(signature)
  gsap.set(sigChars, { autoAlpha: 0, y: 14 })
  gsap.to(sigChars, {
    autoAlpha: 1,
    y: 0,
    duration: 0.35,
    stagger: 0.06,
    ease: 'power2.out',
    scrollTrigger: { trigger: signature, start: 'top 85%' },
  })

  const heartsBox = document.querySelector('.finale__hearts')
  for (let i = 0; i < 12; i++) {
    const heart = document.createElement('span')
    heart.className = 'heart'
    heart.textContent = '♥'
    gsap.set(heart, {
      left: gsap.utils.random(4, 94) + '%',
      top: '105%',
      fontSize: gsap.utils.random(0.7, 1.6) + 'rem',
      opacity: gsap.utils.random(0.25, 0.6),
    })
    heartsBox.appendChild(heart)

    gsap.to(heart, {
      y: () => -heartsBox.offsetHeight - 120,
      x: '+=' + gsap.utils.random(-50, 50),
      rotate: gsap.utils.random(-40, 40),
      duration: gsap.utils.random(7, 13),
      repeat: -1,
      delay: gsap.utils.random(0, 9),
      ease: 'none',
    })
  }
}

/* ============================================================
   COUNTDOWN — to 21.08.2026, Tashkent time (UTC+5)
   ============================================================ */

function initCountdown() {
  const target = new Date('2026-08-21T00:00:00+05:00').getTime()
  const els = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins: document.getElementById('cd-mins'),
    secs: document.getElementById('cd-secs'),
  }
  const labels = {
    days: document.getElementById('cd-days-label'),
    hours: document.getElementById('cd-hours-label'),
    mins: document.getElementById('cd-mins-label'),
    secs: document.getElementById('cd-secs-label'),
  }

  function plural(n, one, few, many) {
    const mod10 = n % 10
    const mod100 = n % 100
    if (mod10 === 1 && mod100 !== 11) return one
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
    return many
  }

  function setValue(el, value) {
    const text = String(value).padStart(2, '0')
    if (el.textContent === text) return
    el.textContent = text
    if (!reducedMotion && window.gsap) {
      gsap.fromTo(el, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.35, ease: 'power2.out' })
    }
  }

  function tick() {
    const diff = target - Date.now()

    if (diff <= 0) {
      document.getElementById('countdown-grid').hidden = true
      document.getElementById('countdown-done').hidden = false
      clearInterval(timer)
      return
    }

    const days = Math.floor(diff / 86400000)
    const hours = Math.floor(diff / 3600000) % 24
    const mins = Math.floor(diff / 60000) % 60
    const secs = Math.floor(diff / 1000) % 60

    setValue(els.days, days)
    setValue(els.hours, hours)
    setValue(els.mins, mins)
    setValue(els.secs, secs)

    labels.days.textContent = plural(days, 'день', 'дня', 'дней')
    labels.hours.textContent = plural(hours, 'час', 'часа', 'часов')
    labels.mins.textContent = plural(mins, 'минута', 'минуты', 'минут')
    labels.secs.textContent = plural(secs, 'секунда', 'секунды', 'секунд')
  }

  tick()
  const timer = setInterval(tick, 1000)
}

/* ============================================================
   MUSIC — drop your track at assets/audio/music.mp3
   ============================================================ */

function initMusic() {
  const audio = document.getElementById('bg-music')
  const btn = document.getElementById('music-toggle')
  const GESTURES = ['pointerdown', 'keydown', 'touchend']
  let autoStartArmed = false

  function start() {
    audio.volume = 0
    return audio.play().then(() => {
      gsap.to(audio, { volume: 0.55, duration: 1.2 })
      btn.classList.add('is-playing')
      btn.setAttribute('aria-label', 'Выключить музыку')
      if (!reducedMotion) {
        gsap.to('.music-toggle__bars i', {
          height: () => gsap.utils.random(8, 18),
          duration: 0.3,
          repeat: -1,
          yoyo: true,
          repeatRefresh: true,
          stagger: 0.12,
          ease: 'sine.inOut',
        })
      }
    })
  }

  function stop() {
    gsap.to(audio, { volume: 0, duration: 0.6, onComplete: () => audio.pause() })
    btn.classList.remove('is-playing')
    btn.setAttribute('aria-label', 'Включить музыку')
    gsap.killTweensOf('.music-toggle__bars i')
  }

  /* music is on by default: try right away, otherwise wait for the first gesture */
  function disarmAutoStart() {
    autoStartArmed = false
    GESTURES.forEach((t) => window.removeEventListener(t, onFirstGesture))
  }

  function onFirstGesture(e) {
    if (!autoStartArmed) return disarmAutoStart()
    if (e.target.closest && e.target.closest('.music-toggle')) return disarmAutoStart()
    disarmAutoStart()
    start().catch(() => {})
  }

  function attemptAutoplay() {
    start().catch(() => {
      autoStartArmed = true
      GESTURES.forEach((t) => window.addEventListener(t, onFirstGesture))
    })
  }

  // show the button (and start the music) only if the track actually exists
  fetch(audio.getAttribute('src'), { method: 'HEAD' })
    .then((res) => {
      if (!res.ok) return
      btn.hidden = false
      attemptAutoplay()
    })
    .catch(() => {})

  btn.addEventListener('click', () => {
    disarmAutoStart() // the user took control — no more auto-starting
    if (audio.paused) {
      start().catch(() => {})
    } else {
      stop()
    }
  })
}

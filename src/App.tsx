import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import cloudflareLogo from './assets/Cloudflare_Logo.svg'

function App() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('unknown')

  return (
    <div className='max-w-5xl mx-auto p-8 text-center'>
      <div className='flex justify-center'>
        <a href='https://vite.dev' target='_blank'>
          <img src={viteLogo} className='h-24 p-6 transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#646cffaa]' alt='Vite logo' />
        </a>
        <a href='https://react.dev' target='_blank'>
          <img src={reactLogo} className='h-24 p-6 transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#61dafbaa] motion-safe:animate-spin-slow' alt='React logo' />
        </a>
        <a href='https://workers.cloudflare.com/' target='_blank'>
          <img src={cloudflareLogo} className='h-24 p-6 transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#f6821faa]' alt='Cloudflare logo' />
        </a>
      </div>
      <h1 className='text-5xl leading-tight'>Vite + React + Cloudflare</h1>
      <div className='p-8'>
        <button
          onClick={() => setCount((count) => count + 1)}
          aria-label='increment'
          className='rounded-lg border border-transparent px-5 py-2.5 text-base font-medium bg-zinc-900 cursor-pointer transition-colors hover:border-indigo-500 focus:outline-4 focus:outline-auto'
        >
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <div className='p-8'>
        <button
          onClick={() => {
            fetch('/api/')
              .then((res) => res.json() as Promise<{ name: string }>)
              .then((data) => setName(data.name))
          }}
          aria-label='get name'
          className='rounded-lg border border-transparent px-5 py-2.5 text-base font-medium bg-zinc-900 cursor-pointer transition-colors hover:border-indigo-500 focus:outline-4 focus:outline-auto'
        >
          Name from API is: {name}
        </button>
        <p>
          Edit <code>worker/index.ts</code> to change the name
        </p>
      </div>
      <p className='text-gray-500'>
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App

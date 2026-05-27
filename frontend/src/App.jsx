
import './App.css'
import ChatApp from './components/ChatApp'
import { use } from 'react'
import { connectWS } from './connectWS'
import { useState,  useEffect, useRef  } from 'react'
import { Socket } from 'socket.io-client'


function App() {

    const [userName, setUserName] = useState('')
    const [showNamePopup, setShowNamePopup] = useState(true)
    const [inputName, setInputName] = useState('')


    const [messages, setMessages] = useState([])
    const [text, setText] = useState('')
    const [typingUsers, setTypingUsers] = useState([]) 

    const soket =useRef(null)
    const timer = useRef(null)
    const msgEndRef = useRef(null)

    useEffect(()=>{
      soket.current= connectWS();

        soket.current.on('connect', ()=>{

          soket.current.on('roomNotice', (userName)=>{
            console.log(`${userName} joined the room !`)
          })

          soket.current.on('chatmessage', (msg)=>{
            console.log('New message:', msg) ;
            setMessages((prev)=>[...prev, msg])
          })

          soket.current.on('typing', (userName)=>{
            console.log(`${userName} is typing...`)
            setTypingUsers((prev)=>{
              const isExist = prev.find((typer) => typer === userName)
              if(!isExist) {
                return [...prev, userName]
              }
              return prev
            })
          })
        })
         
        
        soket.current.on('stopTyping', (userName)=>{
            setTypingUsers((prev)=> prev.filter((typer)=>typer !== userName)
            )
        })

          return ()=>{
          soket.current.off('roomNotice')
          soket.current.off('chatmessage')
          soket.current.off('typing')
           soket.current.off('stopTyping')

        }
  
    },[]);

        useEffect(()=>{
      if(text) {
        soket.current.emit('typing', userName) 
        clearTimeout(timer.current)
      }
      timer.current = setTimeout(()=>{
          soket.current.emit('stopTyping', userName)
        },1000)

        return ()=>{
          clearTimeout(timer.current)
        }
      

    }, [text, userName])

useEffect(() => {
  msgEndRef.current?.scrollIntoView({ behavior: 'smooth' })
}, [messages])


    function formatTime(ts) {
      const d = new Date(ts);
      const hh = d.getHours().toString().padStart(2, '0');
      const mm = d.getMinutes().toString().padStart(2, '0');
      return `${hh}:${mm}`;
    }


    function handelNameSubmit(e) {
      e.preventDefault()
      const trimed = inputName.trim()
      if (!trimed) return alert('Name cannot be empty')
      soket.current.emit('joinRoom', trimed)


      setUserName(trimed)
      setShowNamePopup(false)
    }

    function sendMessage() {
      const t = text.trim()
      if (!t) return alert('Message cannot be empty')
        const msg = {
        text:t,
        id: Date.now(),
        sender: userName,
        ts: formatTime(Date.now())  
      
      }


       setMessages((prev)=>[...prev, msg]) 

      soket.current.emit('chatmessage', msg)
      setText('')
    }

    function handelKeyDown(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
    } 




  return (
    <>



  
     <div id="success-screen" class="hidden text-center">
    <div class="bg-white rounded-2xl shadow-xl p-8 max-w-xs w-full mx-auto">
      <div class="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <h3 class="text-lg font-bold text-gray-800 mb-1">Welcome, <span id="display-name" class="text-[#25D366]"></span>!</h3>
      <p class="text-sm text-gray-500">You're all set to start chatting.</p>
      <button onclick="" class="mt-5 text-sm text-[#25D366] hover:underline font-medium">← Back</button>
    </div>
    </div>
    

    {showNamePopup && ( <div className="fixed inset-0 bg-gray-900 backdrop-blur-sm flex items-center justify-center p-4"  >
 
    {/* <!-- Modal card --> */}
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
 
      {/* <!-- Title --> */}
      <h2 className="text-xl font-bold text-gray-900 mb-1">Enter your name</h2>
 
      {/* <!-- Subtitle --> */}
      <p className="text-sm text-gray-500 mb-5 leading-relaxed">
        Enter your name to start chatting. This will be used to identify you in the chat.
      </p>
 
      {/* <!-- Input --> */}
      <input

        type="text"
        placeholder="Your name (e.g. John Doe)"
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 bg-gray-50 outline-none focus:ring-2 focus:ring-[#25D366]/40 focus:border-[#25D366] transition mb-5"
        value={inputName}
        onChange={(e)=>setInputName(e.target.value)}
      />
 
      {/* <!-- Continue button --> */}
      <div className="flex justify-end">
        <button
         onClick={handelNameSubmit}
          className="bg-[#25D366] hover:bg-[#1ebe5d] active:scale-95 transition-all text-white font-semibold text-sm px-6 py-2.5 rounded-full shadow-sm"
        >
          Continue
        </button>
      </div>
 
    </div>
      </div>)}
   



  
 
  {/* <!-- Success screen (hidden by default) --> */}
 










<div className="max-w-5xl   bg-gray-800 max-h-screen min-h-screen rounded-2xl shadow-lg flex flex-col overflow-hidden mx-auto">
 
    {/* <!-- Header --> */}
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white font-semibold text-base select-none">
          GC
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800 leading-tight">Realtime group chat</p>
          <div className="flex items-center gap-1 mt-0.5" >
            <span className="typing-dot"></span>
            <span className="typing-dot"></span> 
            <span className="typing-dot"></span>
            {typingUsers.length ? (<span className="text-xs text-gray-400 ml-1">{typingUsers.join(', ')} is typing...</span>): null}
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-400">
        Signed in as <span className="font-semibold text-gray-600">{userName}</span>
      </div>
    </div>
 
    {/* <!-- Chat body --> */}
    <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#f0f2f5] space-y-2">
 

 
      {/* <!-- Sent message --> */}
      <div className="">
     {messages.map((m)=>{
      const mine = m.sender === userName
      return (
        <div className={`flex my-4 ${mine? 'justify-end' : 'justify-start'}`}
        key={m.id}
        >
          <div className={`max-w-[75%] px-4 py-2 rounded-lg
             ${mine? 
             'bg-[#dcf8c6] text-[#303030] text-right rounded-br-2xl' 
             : 'bg-white text-[#303030] text-left rounded-bl-2xl'}`}
             >
          <p className="text-sm text-gray-800 text-wrap">{m.text}</p>
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className="text-[10px] text-gray-500 font-medium">{m.sender}</span>
            <span className="text-[10px] text-gray-400">{m.ts}</span>
            <svg className="w-3.5 h-3.5 text-[#53bdeb]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.5 5.5L9 14l-4-4-1.5 1.5L9 17l10-10z"/>
              <path d="M21.5 5.5L13 14l-1.5-1.5 1.5-1.5 7.5-7.5z" opacity=".6"/>
            </svg>
            </div>
          </div>
        </div>
      )
     })}
      <div ref={msgEndRef} />
      </div>
{/*  
      <!-- Anchor for auto-scroll --> */}
      {/* <div id="msg-end"></div> */}
    </div>
{/*  <!-- Input bar --> */}
    <div className="px-3 py-3 bg-white border-t border-gray-100 flex items-center gap-2">
      {/* <!-- Emoji button --> */}
      {/* <button className="text-gray-400 hover:text-gray-500 transition p-1 rounded-full hover:bg-gray-100" title="Emoji">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <circle cx="12" cy="12" r="9"/><path d="M8.5 14s1 2 3.5 2 3.5-2 3.5-2"/><line x1="9" y1="10" x2="9.01" y2="10"/><line x1="15" y1="10" x2="15.01" y2="10"/>
        </svg>
      </button> */}
 
      {/* <!-- Text input --> */}
      <input
        
        type="text"
        value={text}
        onChange={(e)=>setText(e.target.value)}
        onKeyDown={handelKeyDown}
        placeholder="Type a message..."
        className="flex-1 bg-[#f0f2f5] rounded-full px-4 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#25D366]/30 transition"
       
      />
 
     {/* Attachment button  */}
{/* 
      <button className="text-gray-400 hover:text-gray-500 transition p-1 rounded-full hover:bg-gray-100" title="Attach">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
        </svg>
      </button> */}
 
      {/* <!-- Send button --> */}
      <button
        id=""
        onClick={sendMessage}
        className="bg-[#25D366] hover:bg-[#1ebe5d] active:scale-95 transition-all text-white rounded-full px-4 py-2 text-sm font-semibold shadow-sm"
      >
        Send
      </button>
    </div>
  </div>



    </>
  )
}

export default App

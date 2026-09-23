import React, { useState, useRef, useEffect } from 'react'
import maleVideo from "../assets/videos/male-ai.mp4"
import femaleVideo from "../assets/videos/female-ai.mp4"
import Timer from './Timer';
import { motion } from "motion/react"
import {FaMicrophone} from "react-icons/fa";

function Step2Interview({ interviewData, onFinish }) {
    const { interviewId, questions = [], userRole } = interviewData;
    const [isIntroPhase, setIsIntroPhase] = useState(true);

    const [isMicOn, setIsMicOn] = useState(true);
    const recognitionRef = useRef(null);
    const [isAiPlaying, setIsAiPlaying] = useState(false);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState("");
    const [feedback, setFeedback] = useState("");
    const [timeLeft, setTimeLeft] = useState(
        questions[0]?.timeLimit || 60
    );

    const [selectedVoice, setSelectedVoice] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [voiceGender, setVoiceGender] = useState("female");
    const [subtitle, setSubtitle] = useState("");


    const videoRef = useRef(null);

    const currentQuestion = questions[currentIndex];
    useEffect(() => {
    const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (!voices.length) return;

        // Try known Google voices first
        const femaleVoice = voices.find(v => 
            v.name.toLowerCase().includes("zira") ||
            v.name.toLowerCase().includes("samantha") ||
            v.name.toLowerCase().includes("female")
        );

        if (femaleVoice) {
            setSelectedVoice(femaleVoice);
            setVoiceGender("female");
            return;
        }

        // Try known male voices
        const maleVoice = 
            voices.find(v => 
                v.name.toLowerCase().includes("david") ||
                v.name.toLowerCase().includes("mark") ||
                v.name.toLowerCase().includes("male")
            );

            if (maleVoice) {
                setSelectedVoice(maleVoice);
                setVoiceGender("male");
                return;
            }
            };
            // fallback: first voice (assume it's female)
            setSelectedVoice(voices[0]);
            setVoiceGender("female");

            loadVoices();
                window.speechSynthesis.onvoiceschanged = loadVoices;
        }, []);

                // SPEAK FUNCTION
        const speakText = (text) => {
            return new Promise((resolve) => {
                if (!window.speechSynthesis || !selectedVoice) {
                    resolve();
                    return;
                }

                window.speechSynthesis.cancel();

                // Add natural pauses after commas and periods
                const humanText = text
                    .replace(/,/g, ", ... ")
                    .replace(/\./g, ". ... ");

                const utterance = new SpeechSynthesisUtterance(humanText);

                utterance.voice = selectedVoice;
                utterance.rate = 0.95;
                utterance.pitch = 1.05;
                utterance.volume = 1;

                utterance.onstart = () => {
                    setIsAiPlaying(true);
                        videoRef.current?.play();
                };

                utterance.onend = () => {
  
                        videoRef.current?.pause();
                        videoRef.current.currentTime = 0;
                        setIsAiPlaying(false);

                        setTimeout(() => {
                          setSubtitle(""); // Clear subtitle after speech ends
                            resolve();
                        }, 300); 
                };

                setSubtitle(text); // Set subtitle when speech starts

                window.speechSynthesis.speak(utterance);
            });
        };


          const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;
    return (
        <div className='min-h-screen bg-linear-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center p-4 sm:p-6'>

            <div className='w-full max-w-350 min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden'>

                {/* Video section */}
                <div className='w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-gray-200'>

                    <div className='w-full max-w-sm rounded-2xl overflow-hidden shadow-xl'>

                        <video 
                            src={videoSource}
                            key={videoSource}
                            ref={videoRef}
                            muted
                            playsInline
                            preload="auto"
                            className="w-full h-auto object-cover"
                        />

                    </div>

                    {/* Timer Area */}
                    <div className='w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5'>

                        <div className='flex justify-between items-center'>

                            <span className='text-sm text-gray-500'>
                                Interview Status
                            </span>
                            {
                             isAiPlaying && <span className='text-sm font-semibold text-emerald-600'>
                               {isAiPlaying? "AI speaking": ""} 
                            </span>
                            } 

                        </div>

                        <div className='h-px bg-gray-200'></div>
                            
                        <div className='flex justify-center'>
                               <Timer
                              timeLeft={timeLeft}
                              totalTime={currentQuestion?.timeLimit || 60}
                              />
                        </div>

                        <div className='h-px bg-gray-200'></div>
                        <div className='grid grid-cols-2 gap-6 text-center'>
                        <div>
                            <span className='text-2xl font-bold text-emerald-600'>{currentIndex + 1}</span>
                            <span className='text-xs text-gray-400'>Current Questions</span>
                        </div>
                        <div className='h-px bg-gray-200'></div>
                        <div>
                            <span className='text-2xl font-bold text-emerald-600'>{questions.length}</span>
                            <span className='text-xs text-gray-400'>Total Questions</span>
                        </div>
                    </div>
                    </div>

                </div>
              {/* Text / Interview section */}
              <div className='w-full lg:w-[65%] p-6 sm:p-8 flex flex-col'>

                  <h2 className='text-xl sm:text-2xl font-bold text-emerald-600 mb-6'>
                      AI Smart Interview
                  </h2>

                  {/* Question */}
                  <div className='relative mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-200 shadow-sm'>

                      <p className='text-xs sm:text-sm text-gray-400 mb-2'>
                          Question {currentIndex + 1} of {questions.length}
                      </p>

                      <div className='text-base sm:text-lg font-semibold text-gray-800 leading-relaxed'>
                            {currentQuestion?.question}
                      </div>

                  </div>

                  {/* Answer */}
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="flex-1 min-h-[200px] bg-gray-100 p-4 sm:p-6 rounded-2xl 
                    resize-none outline-none border border-gray-200 
                    focus:ring-2 focus:ring-emerald-500 transition text-gray-800"
                />

                  {/* Buttons */}
                  <div className='flex items-center gap-4 sm:gap-6 mt-6'>

                      <motion.button
                          whileTap={{ scale: 0.9 }}
                          className='w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center 
                          rounded-full bg-black text-white shadow-lg'
                      >
                          <FaMicrophone size={20} />
                      </motion.button>

                      <motion.button
                          whileTap={{ scale: 0.95 }}
                          className='flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 
                          text-white py-3 sm:py-4 rounded-2xl shadow-lg 
                          hover:opacity-90 transition font-semibold'
                      >
                          Submit Answer
                      </motion.button>

                  </div>

              </div>
            </div>
        </div>
    );
}

export default Step2Interview;
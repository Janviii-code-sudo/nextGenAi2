import React, { useState, useRef, useEffect } from 'react'
import maleVideo from "../assets/videos/male-ai.mp4"
import femaleVideo from "../assets/videos/female-ai.mp4"
import Timer from './Timer';
import { motion } from "motion/react"
import {FaMicrophone, FaMicrophoneSlash} from "react-icons/fa";
import axios from 'axios';
import { ServerUrl } from '../App';
import { BsArrowRight } from 'react-icons/bs';   


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
                    stopMic(); // Stop mic when AI starts speaking
                        videoRef.current?.play();
                };

                utterance.onend = () => {
  
                        videoRef.current?.pause();
                        videoRef.current.currentTime = 0;
                        setIsAiPlaying(false);

                        if(isMicOn) startMic(); // Restart mic if it was on before

                        setTimeout(() => {
                          setSubtitle(""); // Clear subtitle after speech ends
                            resolve();
                        }, 300); 
                };

                setSubtitle(text); // Set subtitle when speech starts

                window.speechSynthesis.speak(utterance);
            });
        };
        useEffect(() => {
            if (!selectedVoice) return;

            const runIntro = async () => {
                if(isIntroPhase) {
                await speakText(
                `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`
                );

                await speakText(
                "I'll ask you a few questions. Just answer naturally, take your time. Let's begin."
                );

                setIntroPhase(false)}
                else if (currentQuestion){
                    await new Promise(r => setTimeout(r, 800)); 
                    // if last ques (hard level)
                    if (currentIndex === questions.length - 1) {
                        await speakText(
                            "This is the last question. Give it your best shot!"
                        );
                    }
                    await speakText(currentQuestion.question);
                    if(isMicOn){ 
                        startMic(); // Start mic after question is spoken
                    }
                }
            }
            runIntro();

            }, [selectedVoice , isIntroPhase,currentIndex]);

            useEffect(() => {
                if (isIntroPhase) return;
                if (!currentQuestion) return;
                // if(isSubmitting) return;
                const timer = setInterval(() => {
                    setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                    });
                }, 1000);

                return () => clearInterval(timer);
                }, [isIntroPhase, currentIndex]);

                
                useEffect(() => {
                if (isIntroPhase && currentQuestion) {
                    setTimeLeft(currentQuestion.timeLimit || 60);
                }
                },  [currentIndex]);

                useEffect(() => {
                if (!("webkitSpeechRecognition" in window)) return;

                const recognition = new  window.webkitSpeechRecognition();

                recognition.lang = "en-US";
                recognition.continuous = true;
                recognition.interimResults = false;

                recognition.onresult = (event) => {
                    const transcript = event.results[event.results.length - 1][0].transcript;
                    setAnswer((prev) => prev + " " + transcript);
                };

                recognitionRef.current = recognition;
                }, []);

                const startMic = () => {
                    if (recognitionRef.current &&  !isAiPlaying) {
                        try{
                            recognitionRef.current.start();
                        } catch{ }
                    }
                };
                
                const stopMic = () => {
                    if (recognitionRef.current) {
                        recognitionRef.current.stop();
                    }
                };
            const toggleMic = () => {
                if (isMicOn) {
                    stopMic();
                } else {
                    startMic();
                }
                setIsMicOn(!isMicOn);
            };

            const submitAnswer = async () => {
                if (isSubmitting) return;
                stopMic(); // Stop mic when submitting
                setIsSubmitting(true);
            
            try {
                const result= await axios.post(
                    ServerUrl + `/api/interview/${interviewId}/submit-answer`, {
                        interviewId,
                        questionIndex: currentIndex,
                        answer,
                        timeTaken: currentQuestion.timeLimit - timeLeft
                    },
                    {
                        withCredentials: true
                    }
                );
                setFeedback(result.data.feedback);
                speakText(result.data.feedback);
                setIsSubmitting(false);
            }
            catch(error) {
                console.log(error);
                setIsSubmitting(false);
            }
        }
        const handleNext = async () => {
            // Clear previous answer and feedback
            setAnswer("");
            setFeedback("");

            // Check if this was the last question
            if (currentIndex + 1 >= questions.length) {
                finishInterview();
                return;
            }

            // Speak transition message
            await speakText("Alright, let's move to the next question.");

            // Move to next question
            setCurrentIndex((prevIndex) => prevIndex + 1);

            // Start microphone after small delay
            setTimeout(() => {
                if (isMicOn) {
                    startMic();
                }
            }, 500);
        };
        const finishInterview = async () => {
            stopMic();
            setIsMicOn(false);
            try {
                const result = await axios.post(ServerUrl + "/api/interview/finish",
                    { interviewId },
                    { withCredentials: true }
                );
                onFinish(result.data
                );
            } catch (error) {
                console.log(error);
            }
            };

            useEffect(() => {
                if (isIntroPhase) return;
                if (!currentQuestion) return;

                if (timeLeft === 0 && !isSubmitting && !feedback) {
                    handleSubmit();
                }
                }, [timeLeft]);

                useEffect(() => {
                return () => {
                    if (recognitionRef.current) {
                    recognitionRef.current.stop();
                    recognitionRef.current.abort();
                    }
                    window.speechSynthesis.cancel();
                }
                }, []);



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

                    {/* subtitle */}
                    {subtitle && (
                    <div className='w-full max-w-md bg-gray-50 border
                         border-gray-200 rounded-xl p-4 shadow-sm'>
                        <p className='text-gray-700 text-sm sm:text-base 
                            font-medium text-center leading-relaxed'>{subtitle}</p>
                    </div>
                    )}

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
                  {!isIntroPhase && (
                      <div className='relative mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-200 shadow-sm'>

                      <p className='text-xs sm:text-sm text-gray-400 mb-2'>
                          Question {currentIndex + 1} of {questions.length}
                      </p>

                      <div className='text-base sm:text-lg font-semibold text-gray-800 leading-relaxed'>
                            {currentQuestion?.question}
                      </div>

                  </div>)
}
                  {/* Answer */}
                  <textarea
                     placeholder="Type your answer here..."
                    onChange={(e) => setAnswer(e.target.value)}
                    value={answer}
                    className="flex-1 min-h-[200px] bg-gray-100 p-4 sm:p-6 rounded-2xl 
                    resize-none outline-none border border-gray-200 
                    focus:ring-2 focus:ring-emerald-500 transition text-gray-800"
                />

                  {/* Buttons */}
              {!feedback ? (
                    <div className="flex items-center gap-4 sm:gap-6 mt-6">

                        <motion.button
                            onClick={toggleMic}
                            whileTap={{ scale: 0.9 }}
                            className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center 
                                    rounded-full bg-black text-white shadow-lg"
                        >
                            {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20}  />}
                        </motion.button>

                        <motion.button
                            onClick={submitAnswer}
                            disabled={isSubmitting}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 
                                    text-white py-3 sm:py-4 rounded-2xl shadow-lg 
                                    hover:opacity-90 transition font-semibold 
                                    disabled:bg-gray-500"
                        >
                            {isSubmitting ? "Submitting..." : "Submit Answer"}
                        </motion.button>

                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-6 bg-emerald-50 border border-emerald-200 
                                p-3 rounded-xl shadow-sm"
                    >
                        <p className="text-emerald-700 font-medium mb-4">
                            {feedback}
                        </p>

                        <button
                                onClick={handleNext}
                            className="w-full bg-gradient-to-r from-emerald-600 
                                    to-teal-500 text-white py-3 rounded-xl 
                                    shadow-md hover:opacity-90 transition 
                                    flex items-center justify-center gap-1"
                        >
                            Next Question <BsArrowRight  size={18} />
                        </button>

                    </motion.div>
                )}

              </div>
            </div>
        </div>
    );
}

export default Step2Interview;
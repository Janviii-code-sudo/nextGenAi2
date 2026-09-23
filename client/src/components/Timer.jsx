import React from 'react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function Timer({ timeLeft, totalTime }) {
    const percentage = (timeLeft / totalTime) * 100;
    return (
        <div className='w-28 h-28'>
            <CircularProgressbar
                value={percentage}
                text={`${timeLeft}s`}
                styles={buildStyles({
                    textSize: '28px',
                    pathColor: '#10b981',
                    textColor: '#0f172a',
                    trailColor: '#e2e8f0',
                })}
            />
        </div>
    )
}

export default Timer
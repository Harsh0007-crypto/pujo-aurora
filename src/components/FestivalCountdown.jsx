import React, { useState, useEffect } from 'react';
import { FESTIVAL_DATES } from '../data/tracks';
import { Calendar, Sparkles } from 'lucide-react';

/**
 * FestivalCountdown
 * Computes live countdown to the next Durga Puja festival.
 * Accurately handles expired dates, leap years, and future years dynamically.
 */
const FestivalCountdown = ({ lang = 'bn', compact = false }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isToday: false,
    targetName: ''
  });

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();

      // Find the next upcoming festival date from the schedule, or compute next year
      let target = FESTIVAL_DATES.find(f => new Date(f.date) > now);

      if (!target) {
        // Fallback if beyond predefined years: default to next year Ashwin (mid-October)
        const nextYear = now.getFullYear() + 1;
        target = {
          year: nextYear,
          date: `${nextYear}-10-06T06:00:00+05:30`,
          nameBn: `দুর্গাপূজা ${nextYear}`,
          nameEn: `Durga Puja ${nextYear}`
        };
      }

      const diff = new Date(target.date) - now;

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isToday: true,
          targetName: lang === 'bn' ? 'শুভ দুর্গোৎসব আজ!' : 'Happy Durga Puja Today!'
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isToday: false,
        targetName: lang === 'bn' ? target.nameBn : target.nameEn
      });
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, [lang]);

  // Convert numbers to Bengali digits if Bengali is selected
  const toBnDigits = (num) => {
    if (lang !== 'bn') return num.toString().padStart(2, '0');
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num
      .toString()
      .padStart(2, '0')
      .split('')
      .map((d) => bnDigits[parseInt(d, 10)] ?? d)
      .join('');
  };

  if (compact) {
    return (
      <div className="countdown-pill" title={timeLeft.targetName}>
        <Sparkles size={14} className="countdown-sparkle-icon" />
        <span className="countdown-label">
          {lang === 'bn' ? 'পুজোর বাকি' : 'Countdown'}:
        </span>
        <span className="countdown-value">
          {toBnDigits(timeLeft.days)} {lang === 'bn' ? 'দিন' : 'd'} {toBnDigits(timeLeft.hours)} {lang === 'bn' ? 'ঘণ্টা' : 'h'}
        </span>
      </div>
    );
  }

  return (
    <div className="festival-countdown-card glass-morphism">
      <div className="countdown-header">
        <Calendar size={14} />
        <span>{timeLeft.targetName}</span>
      </div>
      <div className="countdown-grid">
        <div className="countdown-unit">
          <span className="unit-number">{toBnDigits(timeLeft.days)}</span>
          <span className="unit-label">{lang === 'bn' ? 'দিন' : 'Days'}</span>
        </div>
        <div className="countdown-colon">:</div>
        <div className="countdown-unit">
          <span className="unit-number">{toBnDigits(timeLeft.hours)}</span>
          <span className="unit-label">{lang === 'bn' ? 'ঘণ্টা' : 'Hours'}</span>
        </div>
        <div className="countdown-colon">:</div>
        <div className="countdown-unit">
          <span className="unit-number">{toBnDigits(timeLeft.minutes)}</span>
          <span className="unit-label">{lang === 'bn' ? 'মিনিট' : 'Mins'}</span>
        </div>
        <div className="countdown-colon">:</div>
        <div className="countdown-unit">
          <span className="unit-number">{toBnDigits(timeLeft.seconds)}</span>
          <span className="unit-label">{lang === 'bn' ? 'সেকেন্ড' : 'Secs'}</span>
        </div>
      </div>
    </div>
  );
};

export default FestivalCountdown;

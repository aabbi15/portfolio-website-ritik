import { useEffect, useState, useRef } from 'react';

interface TypedTextProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayAfterDelete?: number;
  delayAfterType?: number;
  className?: string;
  cursorClassName?: string;
  cursor?: boolean;
  repeat?: boolean;
  tag?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div';
}

export default function TypedText({
  texts,
  typingSpeed = 100,
  deletingSpeed = 50,
  delayAfterDelete = 500,
  delayAfterType = 2000,
  className = '',
  cursorClassName = 'text-primary',
  cursor = true,
  repeat = true,
  tag: Tag = 'span',
}: TypedTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  
  const textRef = useRef('');
  const timeoutRef = useRef<number | null>(null);
  const cursorTimeoutRef = useRef<number | null>(null);

  // Cursor blinking
  useEffect(() => {
    if (cursor) {
      const blinkCursor = () => {
        setCursorVisible(prev => !prev);
        cursorTimeoutRef.current = window.setTimeout(blinkCursor, 500) as unknown as number;
      };
      
      blinkCursor();
      
      return () => {
        if (cursorTimeoutRef.current) {
          clearTimeout(cursorTimeoutRef.current);
        }
      };
    }
  }, [cursor]);

  // Typing effect
  useEffect(() => {
    if (!texts || texts.length === 0) return;
    
    const currentText = texts[currentTextIndex];
    
    const type = () => {
      if (isTyping && textRef.current.length < currentText.length) {
        textRef.current = currentText.substring(0, textRef.current.length + 1);
        setDisplayText(textRef.current);
        timeoutRef.current = window.setTimeout(type, typingSpeed) as unknown as number;
      } else if (isTyping && textRef.current.length === currentText.length) {
        setIsTyping(false);
        timeoutRef.current = window.setTimeout(() => {
          setIsDeleting(true);
        }, delayAfterType) as unknown as number;
      } else if (isDeleting && textRef.current.length > 0) {
        textRef.current = textRef.current.substring(0, textRef.current.length - 1);
        setDisplayText(textRef.current);
        timeoutRef.current = window.setTimeout(type, deletingSpeed) as unknown as number;
      } else if (isDeleting && textRef.current.length === 0) {
        setIsDeleting(false);
        const nextIndex = (currentTextIndex + 1) % texts.length;
        
        // If we've gone through all texts and repeat is false, stop
        if (nextIndex === 0 && !repeat) {
          return;
        }
        
        timeoutRef.current = window.setTimeout(() => {
          setCurrentTextIndex(nextIndex);
          setIsTyping(true);
          textRef.current = '';
        }, delayAfterDelete) as unknown as number;
      }
    };
    
    timeoutRef.current = window.setTimeout(type, typingSpeed) as unknown as number;
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    texts, 
    currentTextIndex, 
    isTyping, 
    isDeleting, 
    typingSpeed, 
    deletingSpeed,
    delayAfterDelete,
    delayAfterType,
    repeat
  ]);

  return (
    <Tag className={className}>
      {displayText}
      {cursor && <span className={`animate-blink ${cursorClassName}`} style={{ opacity: cursorVisible ? 1 : 0 }}>|</span>}
    </Tag>
  );
}
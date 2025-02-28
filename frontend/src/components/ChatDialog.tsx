import React, { useRef, useEffect } from 'react';

interface ChatDialogProps {
  meldinger: { rolle: string; innhold: string }[];
  brukerMelding: string;
  onBrukerMeldingEndret: (melding: string) => void;
  onSendMelding: () => void;
  laster: boolean;
}

const ChatDialog: React.FC<ChatDialogProps> = ({
  meldinger,
  brukerMelding,
  onBrukerMeldingEndret,
  onSendMelding,
  laster
}) => {
  const chatBunnRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll til bunnen når nye meldinger legges til
  useEffect(() => {
    if (chatBunnRef.current) {
      chatBunnRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [meldinger]);

  // Fokuser på input når komponenten lastes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMelding();
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {meldinger.map((melding, index) => (
          <div
            key={index}
            className={`flex ${
              melding.rolle === 'bruker' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                melding.rolle === 'bruker'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{melding.innhold}</p>
            </div>
          </div>
        ))}
        {laster && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatBunnRef}></div>
      </div>

      <div className="border-t p-4">
        <div className="flex">
          <textarea
            ref={inputRef}
            className="form-input resize-none"
            rows={3}
            placeholder="Beskriv initiativet ditt..."
            value={brukerMelding}
            onChange={(e) => onBrukerMeldingEndret(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={laster}
          ></textarea>
          <button
            className="btn btn-primary ml-2 self-end"
            onClick={onSendMelding}
            disabled={!brukerMelding.trim() || laster}
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Trykk Enter for å sende, Shift+Enter for ny linje
        </p>
      </div>
    </div>
  );
};

export default ChatDialog; 
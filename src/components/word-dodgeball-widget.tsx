"use client";
import React, { Component, createRef } from 'react';
import LetterSelector, { LetterSelectorHandle } from "@/components/letter-selector";

interface WordDodgeballWidgetProps {}

interface WordDodgeballWidgetState {
    message: string;
    timer: number;
    showOverlay: boolean;
    score: number;
    originalLetters: string[];
    modifiedIndex: number | null;
}

class WordDodgeballWidget extends Component<WordDodgeballWidgetProps, WordDodgeballWidgetState> {
    private letterRefs: React.RefObject<LetterSelectorHandle>[];
    private intervalId: NodeJS.Timeout | null = null;

    constructor(props: WordDodgeballWidgetProps) {
        super(props);
        this.state = {
            message: 'Welcome to Word Dodgeball!',
            timer: 5,
            showOverlay: false,
            score: 0,
            originalLetters: ['B', 'A', 'L', 'L'],
            modifiedIndex: null
        };
        this.letterRefs = [
            createRef<LetterSelectorHandle>(),
            createRef<LetterSelectorHandle>(),
            createRef<LetterSelectorHandle>(),
            createRef<LetterSelectorHandle>()
        ];
    }

    componentDidMount() {
        this.startTimer();
    }

    componentWillUnmount() {
        this.clearTimer();
    }

    startTimer() {
        this.intervalId = setInterval(() => {
            this.setState(prevState => {
                if (prevState.timer === 1) {
                    this.clearTimer();
                    this.setState({ showOverlay: true });
                    return { timer: 5 };
                }
                return { timer: prevState.timer - 1 };
            });
        }, 1000);
    }

    clearTimer() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    handleLetterChange = (index: number, newLetter: string) => {
        this.setState(prevState => {
            const originalLetters = [...prevState.originalLetters];
            if (prevState.modifiedIndex !== null && prevState.modifiedIndex !== index) {
                originalLetters[prevState.modifiedIndex] = this.letterRefs[prevState.modifiedIndex].current?.getLetter() ?? originalLetters[prevState.modifiedIndex];
            }
            originalLetters[index] = newLetter;
            return {
                originalLetters,
                modifiedIndex: index
            };
        });
    }

    async checkWord() {
        const letters = this.letterRefs.map(ref => ref.current?.getLetter() ?? '');
        const word = letters.join('');
        const isValid = await this.isDictionaryWord(word);
        this.setState({
            message: isValid ? '✅' : '❌'
        });
        if (isValid) {
            this.setState({
                timer: 5,
                score: this.state.score + 1,
                originalLetters: letters,
                modifiedIndex: null
            });
        }
    }

    async isDictionaryWord(word: string) {
        word = word.toLowerCase();
        const apiKey = process.env.NEXT_PUBLIC_WORDS_API_KEY;
        console.log(apiKey);
        const url = `https://wordsapiv1.p.rapidapi.com/words/${word}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com',
                'x-rapidapi-key': `${apiKey}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data);
            console.log(data.word === word);
            return data.word === word;
        } else {
            return false;
        }
    }

    resetGame = () => {
        this.setState({
            message: 'Welcome to Word Dodgeball!',
            timer: 5,
            showOverlay: false,
            score: 0,
            originalLetters: ['B', 'A', 'L', 'L'],
            modifiedIndex: null
        });
        this.startTimer();
    }

    render() {
        return (
            <div>
                <h1>{this.state.message}</h1>
                <h2>Time left: {this.state.timer}</h2>
                <h2>Score: {this.state.score}</h2>
                <div className='flex flex-row space-x-4'>
                    {this.state.originalLetters.map((letter, index) => (
                        <LetterSelector
                            key={index}
                            ref={this.letterRefs[index]}
                            startLetter={letter}
                            onLetterChange={(newLetter: string) => this.handleLetterChange(index, newLetter)}
                        />
                    ))}
                    <button onClick={() => this.checkWord()}>-&gt;</button>
                </div>
                {this.state.showOverlay && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                        <div className="bg-white p-8 rounded-lg text-center">
                            <h2 className="text-2xl mb-4 text-black">Time's up!</h2>
                            <h2 className="text-2xl mb-4 text-black">Score: {this.state.score}</h2>
                            <p className="mb-4 text-black">Do you want to play again?</p>
                            <button onClick={this.resetGame} className="bg-blue-500 text-white px-4 py-2 rounded">Play Again</button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default WordDodgeballWidget;
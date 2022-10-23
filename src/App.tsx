import React from 'react';
import logo from './logo.svg';
import './App.css';
import './GameButton.css';
import * as Tone from 'tone'

enum Color {
    RED= '#E94F2C',
    GREEN = '#80B728',
    BLUE = '#0EA6EA',
    YELLOW = '#FDB92F'
}

type AppProps = {
    // Nothing to see here
}

type AppState = {
    playNumber: number | false
    sequence: Color[],
    playerSequence: Color[]
    gameOver: boolean,
    disablePlay: boolean
}

function GameButton(props: { onClick: () => void, color: Color, active: boolean, synth: any }) {
    let activeClass = '';
    if (props.active === true) {
        activeClass = 'active'
    }

    return <button className={`GameButton ${activeClass}`} style={{ backgroundColor: props.color }} onClick={() => {
        props.onClick();
    }
    }></button>;
}

function GameTitle(props: { score: number }) {

    if (props.score <= 0) {
        return <h2>Simon Says</h2>;

    }

    return <h2>Current score: {props.score}</h2>;
}

function StartButton(props: { onClick: () => void }) {
    return <button onClick={() => {
        props.onClick()
    }}>Start Game</button>;
}

class App extends React.Component {

    public state;
    private interval: NodeJS.Timer | null;
    private synth;

    constructor(props: AppProps) {
        super(props);

        const state: AppState = {
            disablePlay: true,
            gameOver: false,
            playNumber: false,
            sequence: [],
            playerSequence: [],

        }
        this.interval = null;
        this.state = state;

        this.synth = new Tone.Synth().toDestination();
    }

    playSequence = () => {
        this.interval = setInterval(() => {

            let number;
            if (this.state.playNumber === false) {
                number = 0;
            }
            else {
                number = this.state.playNumber + 1;
            }

            this.setState({
                disablePlay: false,
                playNumber: number
            }, () => {
                let number;
                if (!this.state.playNumber) {
                    number = 0;
                }

                let note = this.getNote(Object.keys(Color)[number as number] as Color);
                this.synth.triggerAttackRelease(note, "8n", Tone.now())
            });

            if (number > this.state.sequence.length - 1) {
                if (this.interval) {
                    clearInterval(this.interval as NodeJS.Timer);
                }
            }

            setTimeout(() => {
                this.setState({
                    disablePlay: true
                });
            }, 1000)
        }, 2000);
    }

    startGame = () => {
        const sequence = this.getNextSequence([]);

        this.setState({
            playNumber: 0,
            sequence: sequence,
            gameOver: false
        }, () => {
            this.playSequence();
        })
    }

    getNextSequence = (sequence: Color[]) => {
        const colorKeys = Object.keys(Color);
        const randomIndex = Math.floor(colorKeys.length * Math.random());
        const randomColor = colorKeys[randomIndex];

        sequence.push(randomColor as Color);
        return sequence;
    }

    gameOver = () => {
        this.setState({
            playNumber: 0,
            sequence: [],
            gameOver: true
        }, () => {
        })
    }


    pickColor = (colorKey: string) => {
        const playerSequence = [...this.state.playerSequence];
        playerSequence.push(colorKey as Color);

        const correct = playerSequence.every((value, index) => {
            return this.state.sequence[index] === value;
        })

        if (!correct) {
            this.gameOver();
        }

        if (correct) {
            this.setState({
                playerSequence: playerSequence
            });
        }

        if (correct && playerSequence.length === this.state.sequence.length) {
            const nextSequence = this.getNextSequence([...this.state.sequence]);
            this.setState({
                sequence: nextSequence,
                playerSequence: [],
                playNumber: 0
            }, () => {
                this.playSequence();
            });
        }

    }

    render() {

        return (
            <div className="App">
                <header className="App-header">
                    <GameTitle score={this.state.sequence.length - 1} />
                </header>
                <section className="App-PlayField">
                    {
                        Object.values(Color).map((colorValue: Color, index) => {
                            const colorKey = Object.keys(Color)[index];
                            let active = false;
                            if (
                                this.state.playNumber !== false
                                && this.state.sequence[this.state.playNumber]
                                && this.state.disablePlay === true
                            ) {
                                // @ts-ignore
                                active = (colorValue === Color[this.state.sequence[this.state.playNumber]]);
                            }
                            let note = this.getNote(colorKey as Color);

                            return <GameButton
                                key={colorKey}
                                onClick={() => {
                                    this.synth.triggerAttackRelease(note, "8n", Tone.now())
                                    this.pickColor(colorKey);
                                }}
                                color={colorValue}
                                active={active}
                                synth={this.synth}
                            />;
                        })
                    }
                </section>
                {
                    this.state.gameOver === true ? <p>You lost try again?</p> : null
                }
                <StartButton onClick={this.startGame} />
            </div>
        );
    }

    private getNote(colorKey: Color) {
        let note = 'C4';
        if (colorKey === Color.GREEN) {
            note = 'E4';
        }

        if (colorKey === Color.BLUE) {
            note = 'G4';
        }

        if (colorKey === Color.YELLOW) {
            note = 'B4';
        }
        return note;
    }
}

export default App;

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Star, Clock, CheckCircle, XCircle, QrCode } from 'lucide-react';

// --- API base (Vite proxy should point /api -> Flask) ---
const API_BASE = '/api';

// Mock quiz questions (same as before)
const quizQuestions = [
  { id: 1, question: "What is the primary purpose of React hooks?", options: ["To style components","To manage state and lifecycle in functional components","To create class components","To handle routing"], correctAnswer: 1, explanation: "React hooks allow you to use state and other React features in functional components." },
  { id: 2, question: "Which CSS property is used to control the layout of flex items?", options: ["flex-direction","flex-wrap","justify-content","All of the above"], correctAnswer: 3, explanation: "All these properties are used to control different aspects of flex layout." },
  { id: 3, question: "What does API stand for?", options: ["Application Programming Interface","Advanced Programming Interface","Automated Programming Interface","Application Process Interface"], correctAnswer: 0, explanation: "API stands for Application Programming Interface." },
  { id: 4, question: "Which HTTP method is typically used to update a resource?", options: ["GET","POST","PUT","DELETE"], correctAnswer: 2, explanation: "PUT is commonly used to update existing resources on the server." },
  { id: 5, question: "What is the time complexity of binary search?", options: ["O(n)","O(log n)","O(n²)","O(1)"], correctAnswer: 1, explanation: "Binary search has O(log n) time complexity as it divides the search space in half each iteration." },
  { id: 6, question: "Which database type is MongoDB?", options: ["Relational","NoSQL Document","Graph","In-memory"], correctAnswer: 1, explanation: "MongoDB is a NoSQL document database that stores data in JSON-like documents." },
  { id: 7, question: "What does SQL stand for?", options: ["Structured Query Language","Simple Query Language","Standard Query Language","System Query Language"], correctAnswer: 0, explanation: "SQL stands for Structured Query Language." },
  { id: 8, question: "Which Git command is used to create a new branch?", options: ["git new branch","git checkout -b","git create branch","git branch new"], correctAnswer: 1, explanation: "git checkout -b creates and switches to a new branch in one command." },
  { id: 9, question: "What is the purpose of CSS Grid?", options: ["To create animations","To style text","To create two-dimensional layouts","To handle responsive images"], correctAnswer: 2, explanation: "CSS Grid is designed for creating two-dimensional layouts with rows and columns." },
  { id: 10, question: "Which JavaScript method adds an element to the end of an array?", options: ["push()","pop()","shift()","unshift()"], correctAnswer: 0, explanation: "push() adds one or more elements to the end of an array." }
];

export default function QuizGame() {
  const [gameState, setGameState] = useState('start'); // start, playing, finished, leaderboard
  const [playerName, setPlayerName] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [savingScore, setSavingScore] = useState(false);

  // Timer for each question
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      handleNextQuestion();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameState]);

  // Load leaderboard initially
  useEffect(() => {
    loadLeaderboard();
  }, []);

  function startGame() {
    if (!playerName.trim()) return;
    setGameState('playing');
    setCurrentQuestion(0);
    setAnswers([]);
    setScore(0);
    setTimeLeft(30);
    setShowResults(false);
    setSelectedAnswer(null);
  }

  function selectAnswer(answerIndex) {
    setSelectedAnswer(answerIndex);
  }

  function handleNextQuestion() {
    const isCorrect = selectedAnswer === quizQuestions[currentQuestion].correctAnswer;
    const newAnswers = [
      ...answers,
      {
        questionId: quizQuestions[currentQuestion].id,
        selectedAnswer,
        correct: isCorrect,
        timeTaken: 30 - timeLeft
      }
    ];

    setAnswers(newAnswers);
    if (isCorrect) setScore((s) => s + 1);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion((q) => q + 1);
      setSelectedAnswer(null);
      setTimeLeft(30);
    } else {
      finishGame(newAnswers);
    }
  }

  async function finishGame(finalAnswers) {
    const finalScore = finalAnswers.filter((a) => a.correct).length;
    setScore(finalScore);

    const totalDuration = finalAnswers.reduce((acc, a) => acc + (a.timeTaken || 0), 0);

    // Save to backend, then refresh leaderboard
    try {
      setSavingScore(true);
      await fetch(`${API_BASE}/quiz/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playerName,
          score: finalScore,
          totalQuestions: quizQuestions.length,
          durationSeconds: totalDuration
        })
      });
    } catch (e) {
      console.error('submit error', e);
    } finally {
      setSavingScore(false);
    }

    await loadLeaderboard();
    setGameState('finished');
  }

  function resetGame() {
    setGameState('start');
    setPlayerName('');
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setScore(0);
    setShowResults(false);
    setTimeLeft(30);
  }

  async function loadLeaderboard() {
    try {
      setLoadingLeaderboard(true);
      const res = await fetch(`${API_BASE}/quiz/leaderboard?limit=10&bestOnly=true`);
      const data = await res.json();
      if (Array.isArray(data)) setLeaderboard(data);
    } catch (e) {
      console.error('leaderboard fetch failed', e);
    } finally {
      setLoadingLeaderboard(false);
    }
  }

  function openLeaderboard() {
    setGameState('leaderboard');
    loadLeaderboard();
  }

  function generateQRCode() {
    const publicUrl = `${window.location.origin}/public-quiz`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}`;
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
                <Trophy className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground">Tech Quiz Challenge</h1>
                <p className="text-muted-foreground">Test your technical knowledge</p>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <QrCode className="w-6 h-6 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Scan to play on mobile</p>
                    <img src={generateQRCode()} alt="QR Code" className="w-20 h-20 mt-2" />
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Start Screen */}
          {gameState === 'start' && (
            <div className="max-w-md mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Ready to Start?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="playerName">Enter Your Name</Label>
                    <Input
                      id="playerName"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Your name here..."
                      className="mt-1"
                    />
                  </div>
                  <div className="bg-accent/50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Quiz Rules:</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 10 multiple choice questions</li>
                      <li>• 30 seconds per question</li>
                      <li>• No going back to previous questions</li>
                      <li>• Results shown at the end</li>
                    </ul>
                  </div>
                  <Button onClick={startGame} disabled={!playerName.trim()} className="w-full" size="lg">
                    Start Quiz
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Playing Screen */}
          {gameState === 'playing' && (
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    Question {currentQuestion + 1} of {quizQuestions.length}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-destructive" />
                    <span className={`font-bold text-lg ${timeLeft <= 10 ? 'text-destructive' : 'text-foreground'}`}>
                      {timeLeft}s
                    </span>
                  </div>
                </div>
                <Progress value={(currentQuestion / quizQuestions.length) * 100} className="h-2" />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{quizQuestions[currentQuestion].question}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quizQuestions[currentQuestion].options.map((option, index) => (
                    <Button
                      key={index}
                      variant={selectedAnswer === index ? 'default' : 'outline'}
                      className="w-full justify-start text-left h-auto p-4"
                      onClick={() => selectAnswer(index)}
                    >
                      <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </Button>
                  ))}

                  <div className="pt-4">
                    <Button onClick={handleNextQuestion} disabled={selectedAnswer === null} className="w-full" size="lg">
                      {currentQuestion === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results Screen */}
          {gameState === 'finished' && (
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
                  <p className="text-xl text-muted-foreground">Well done, {playerName}!</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-primary mb-2">{score}</div>
                    <div className="text-2xl text-muted-foreground">out of {quizQuestions.length}</div>
                    <div className="text-lg mt-2">
                      {score >= 8 ? 'Excellent!' : score >= 6 ? 'Good job!' : 'Keep practicing!'}
                    </div>
                    {savingScore && <p className="text-sm text-muted-foreground mt-2">Saving your score…</p>}
                  </div>

                  {!showResults && (
                    <div className="space-y-3">
                      <Button onClick={() => setShowResults(true)} variant="outline" className="w-full">
                        Review Answers
                      </Button>
                      <Button onClick={openLeaderboard} className="w-full">
                        View Leaderboard
                      </Button>
                      <Button onClick={resetGame} variant="outline" className="w-full">
                        Play Again
                      </Button>
                    </div>
                  )}

                  {showResults && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold">Answer Review</h3>
                      {quizQuestions.map((question, index) => {
                        const userAnswer = answers[index];
                        const isCorrect = userAnswer?.correct;

                        return (
                          <Card
                            key={question.id}
                            className={`border-l-4 ${isCorrect ? 'border-l-success' : 'border-l-destructive'}`}
                          >
                            <CardContent className="pt-4">
                              <div className="flex items-start gap-3">
                                {isCorrect ? (
                                  <CheckCircle className="w-6 h-6 text-success mt-1" />
                                ) : (
                                  <XCircle className="w-6 h-6 text-destructive mt-1" />
                                )}
                                <div className="flex-1">
                                  <p className="font-medium mb-2">{question.question}</p>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    <strong>Your answer:</strong>{' '}
                                    {question.options[userAnswer?.selectedAnswer] || 'No answer'}
                                  </p>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    <strong>Correct answer:</strong> {question.options[question.correctAnswer]}
                                  </p>
                                  <p className="text-sm text-success">{question.explanation}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}

                      <div className="space-y-3 pt-4">
                        <Button onClick={openLeaderboard} className="w-full">
                          View Leaderboard
                        </Button>
                        <Button onClick={resetGame} variant="outline" className="w-full">
                          Play Again
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Leaderboard Screen */}
          {gameState === 'leaderboard' && (
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-warning rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-warning-foreground" />
                  </div>
                  <CardTitle className="text-3xl">Leaderboard</CardTitle>
                  <p className="text-muted-foreground">Top performers</p>
                </CardHeader>
                <CardContent>
                  {loadingLeaderboard ? (
                    <p className="text-center text-muted-foreground">Loading…</p>
                  ) : (
                    <div className="space-y-3">
                      {leaderboard.map((entry, index) => (
                        <div
                          key={`${entry.name}-${entry.timestamp}-${index}`}
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            entry.name === playerName ? 'bg-primary/10 border-primary' : 'bg-card'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                index === 0
                                  ? 'bg-warning text-warning-foreground'
                                  : index === 1
                                  ? 'bg-muted text-muted-foreground'
                                  : index === 2
                                  ? 'bg-accent text-accent-foreground'
                                  : 'bg-secondary text-secondary-foreground'
                              }`}
                            >
                              {index < 3 ? <Star className="w-4 h-4" /> : index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{entry.name}</p>
                              <p className="text-sm text-muted-foreground">{entry.timestamp}</p>
                            </div>
                          </div>
                          <Badge variant={index < 3 ? 'default' : 'secondary'} className="text-lg px-3 py-1">
                            {entry.score}/10
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 space-y-3">
                    <Button onClick={resetGame} className="w-full" size="lg">
                      Play Again
                    </Button>
                    <Button onClick={() => setGameState('finished')} variant="outline" className="w-full">
                      Back to Results
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

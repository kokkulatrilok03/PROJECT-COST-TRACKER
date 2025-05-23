import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const AuthContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 350px;
  margin: 50px auto;
  padding: 30px;
  border-radius: 12px;
  background: linear-gradient(145deg, #f6f1e9, #e4dcd2);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  font-family: 'Georgia', serif;
`;

const Title = styled.h2`
  color: #5b4636;
  margin-bottom: 20px;
  letter-spacing: 1px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #bfa88e;
  border-radius: 6px;
  background-color: #fdfaf6;
  color: #5b4636;
  font-size: 14px;
  font-family: 'Georgia', serif;

  &:focus {
    border-color: #9c7c5c;
    outline: none;
    background-color: #fff8ed;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  margin-bottom: 10px;
  background-color: #a47148;
  color: #fff9f2;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  font-family: 'Georgia', serif;
  transition: background-color 0.3s;

  &:hover {
    background-color: #8c5f3a;
  }
`;

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!email || !password) {
      alert('⚠️ Please enter email and password.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      alert('✅ Registration successful!');
      console.log('Registered user:', userCredential.user);
      // Don't navigate — only login should redirect
    } catch (error) {
      console.error('Registration error:', error.message);
      alert(`❌ Registration failed: ${error.message}`);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      alert('⚠️ Please enter email and password.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Logged in:', userCredential.user);
      alert('✅ Login successful!');
      navigate('/items'); // Navigate only after login
    } catch (error) {
      console.error('Login error:', error.message);
      alert(`❌ Login failed: ${error.message}`);
    }
  };

  return (
    <AuthContainer>
      <Title>Vintage Vault Login</Title>
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button onClick={handleRegister}>Register</Button>
      <Button onClick={handleLogin}>Login</Button>
    </AuthContainer>
  );
};

export default Auth;

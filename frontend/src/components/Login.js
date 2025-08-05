import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import axiosInstance from '../app/axiosInstance';
import { useNavigate } from 'react-router-dom';

const LoginComponent = () => {
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Проверяем, залогинен ли уже пользователь
  useEffect(() => {
    const access = localStorage.getItem('access');
    if (access) {
      navigate('/profile', { replace: true });
    }
  }, [navigate]);

  const login = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post('http://localhost:8000/api/token/', {
        username,
        password,
      });

      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);

      // Если авторизация успешна — редиректим на профиль
      navigate('/profile', { replace: true });
    } catch (err) {
      console.error(err);
      setError('Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      {error && <p className="text-danger text-center">{error}</p>}
      <div>
        <h1>Вход</h1>
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="form-control mb-3"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="btn btn-primary w-100"
          onClick={login}
          disabled={loading}
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </div>
    </div>
  );
};

export default LoginComponent;

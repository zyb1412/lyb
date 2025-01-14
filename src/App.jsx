import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';

const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replies, setReplies] = useState([]);
  const [currentMessageId, setCurrentMessageId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [newReply, setNewReply] = useState('');
  const [view, setView] = useState('login'); // 'login' or 'register'
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedMessageContent, setEditedMessageContent] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [allUsers, setAllUsers] = useState([]);

  const currentUserId = token? jwtDecode(token).id : null;

  useEffect(() => {
    if (token) {
      fetchMessages();
      fetchUser();
    }
  }, [token]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get('http://localhost:3001/messages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchReplies = async (messageId) => {
    try {
      const response = await axios.get(`http://localhost:3001/messages/${messageId}/replies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReplies(response.data);
      setCurrentMessageId(messageId);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserUsername(response.data.username);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllUsers(response.data);
    } catch (error) {
      console.error('Error fetching all users:', error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:3001/login', { username, password });
      if (response.data && response.data.token) {
        setToken(response.data.token);
      } else {
        console.error('No token received from login request.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:3001/register', { username, password });
      setView('login'); // 注册成功后跳转到登录界面
    } catch (error) {
      console.error('Error registering:', error);
    }
  };

  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    // 检查留言内容是否为空
    if (!newMessage.trim()) {
      alert('留言内容不能为空');
      return; // 提前返回，不继续执行提交逻辑
    }
  
    try {
      await axios.post('http://localhost:3001/messages', { content: newMessage }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewMessage(''); // 清空输入框
      fetchMessages(); // 重新获取留言列表
    } catch (error) {
      console.error('Error posting message:', error);
    }
  };
  

  const handleSubmitReply = async (messageId, e) => {
    e.preventDefault();
    // 检查回复内容是否为空
    if (!newReply.trim()) {
      alert('回复内容不能为空');
      return; // 提前返回，不继续执行提交逻辑
    }
  
    try {
      await axios.post(`http://localhost:3001/messages/${messageId}/replies`, { content: newReply }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewReply('');
      fetchReplies(messageId);
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };
  

  const handleEditMessage = async (messageId) => {
    // 检查编辑后的留言内容是否为空
    if (!editedMessageContent.trim()) {
      alert('留言内容不能为空');
      return; // 提前返回，不继续执行编辑逻辑
    }
  
    try {
      await axios.put(`http://localhost:3001/messages/${messageId}`, { content: editedMessageContent }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMessages(); // 重新获取留言列表
      setEditingMessageId(null); // 退出编辑状态
      setEditedMessageContent(''); // 清空编辑内容
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };
  

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`http://localhost:3001/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleUpdateUser = async () => {
    try {
      await axios.put('http://localhost:3001/api/user', { username: userUsername, password: userPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('信息更新成功');
      fetchUser(); // 更新用户信息后重新获取用户信息
      fetchMessages(); // 更新用户信息后重新获取留言列表
    } catch (error) {
      console.error('There was an error updating the user data!', error);
    }
  };

  const UserManagement = () => {
    const navigate = useNavigate();
  
    useEffect(() => {
      // 获取用户信息
      fetchUser();
    }, [token]);
  
    // 检查用户是否为管理员
    const isAdmin = () => {
      if (typeof token === 'string' && token) {
        try {
          const user = jwtDecode(token);
          console.log('Decoded token:', user);
          console.log('is_admin value:', user.is_admin);
          if (user.is_admin === 1) {
            console.log('User is admin');
            return true;
          } else {
            console.log('User is not admin');
            return false;
          }
        } catch (error) {
          console.error('Error decoding token:', error);
          return false;
        }
      }
      console.log('Token is invalid or not present');
      return false;
    };
  
  
    return (
      <div>
        <h2>用户管理</h2>
        <div>
          <label>用户名: </label>
          <input type="text" value={userUsername} onChange={(e) => setUserUsername(e.target.value)} />
        </div>
        <div>
          <label>密码: </label>
          <input type="password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} />
        </div>
        <button onClick={handleUpdateUser}>更新信息</button>
        {isAdmin() && (
          <button onClick={() => {
            fetchAllUsers();
            navigate('/all-users');
          }}>查看所有用户</button>
        )}
      </div>
    );
  };

  const AllUsers = () => {
    useEffect(() => {
      fetchAllUsers();
    }, []);

    return (
      <div>
        <h2>所有用户</h2>
        {allUsers.map((user, index) => (
          <p key={index}>{user.username}</p>
        ))}
      </div>
    );
  };

  return (
    <Router>
      <div>
        <nav>
          <Link to="/">首页</Link>
          {token && <Link to="/user-management">用户管理</Link>}
        </nav>
        <Routes>
          <Route path="/" element={
            <div>
              <h1>留言板</h1>
              {!token? (
                <div>
                  {view === 'login'? (
                    <div>
                      <h2>登录</h2>
                      <input
                        type="text"
                        placeholder="用户名"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                      <input
                        type="password"
                        placeholder="密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button onClick={handleLogin}>登录</button>
                      <button onClick={() => setView('register')}>注册</button>
                    </div>
                  ) : (
                    <div>
                      <h2>注册</h2>
                      <input
                        type="text"
                        placeholder="用户名"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                      <input
                        type="password"
                        placeholder="密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button onClick={handleRegister}>注册</button>
                      <button onClick={() => setView('login')}>返回登录</button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <form onSubmit={handleSubmitMessage}>
                    <input
                      type="text"
                      placeholder="输入留言"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit" style={{ backgroundColor: 'black', color: 'white' }}>发表留言</button>
                  </form>
                  <h2>留言列表</h2>
                  {messages.map(message => (
                    <div key={message.id}>
                      {editingMessageId === message.id? (
                        <input
                          type="text"
                          value={editedMessageContent}
                          onChange={(e) => setEditedMessageContent(e.target.value)}
                        />
                      ) : (
                        <p><strong>{message.username}:</strong> {message.content}</p>
                      )}
                      <button onClick={() => fetchReplies(message.id)}>查看回复</button>
                      {currentUserId === message.user_id && (
                        <>
                          {editingMessageId === message.id? (
                            <button onClick={() => handleEditMessage(message.id)}>保存</button>
                          ) : (
                            <button onClick={() => {
                              setEditingMessageId(message.id);
                              setEditedMessageContent(message.content); // 初始化编辑内容为当前留言内容
                            }}>编辑</button>
                          )}
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            style={{ backgroundColor: 'red', color: 'white' }} // 添加样式
                          >
                            删除
                          </button>
                        </>
                      )}
                      {currentMessageId === message.id && (
                        <div>
                          <h3>回复</h3>
                          {replies.map(reply => (
                            <div key={reply.id}>
                              <p><strong>{reply.username}:</strong> {reply.content}</p>
                            </div>
                          ))}
                          <form onSubmit={(e) => handleSubmitReply(message.id, e)}>
                            <input
                              type="text"
                              placeholder="输入回复"
                              value={newReply}
                              onChange={(e) => setNewReply(e.target.value)}
                            />
                            <button type="submit">回复</button>
                          </form>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          } />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/all-users" element={<AllUsers />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
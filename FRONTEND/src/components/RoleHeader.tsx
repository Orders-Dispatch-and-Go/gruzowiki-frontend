// components/Header.tsx
import React from 'react';
import { Layout, Avatar, Dropdown, Space, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, UserSwitchOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const AppHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (user?.role === 'shipper') {
      navigate('/shipper/main');
    } else if (user?.role === 'carrier') {
      navigate('/carrier/main');
    } else {
      navigate('/');
    }
  };

  const handleProfileClick = () => {
    if (user?.role === 'shipper') {
      navigate('/shipper/profile');
    } else if (user?.role === 'carrier') {
      navigate('/carrier/profile');
    }
  };

  const items: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserSwitchOutlined />,
      label: 'Личный кабинет',
      onClick: handleProfileClick,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выйти',
      onClick: logout,
    },
  ];

  return (
    <AntHeader 
      style={{ 
        background: '#fff', 
        padding: '0 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      {/* Логотип */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer' 
        }}
        onClick={handleLogoClick}
      >
        <img 
          src="/logo.png" 
          alt="Logo" 
          style={{ 
            height: 32, 
            marginRight: 8 
          }} 
          onError={(e) => {
            // Заглушка если логотип не загрузился
            e.currentTarget.style.display = 'none';
          }}
        />
        <Text strong style={{ fontSize: '18px' }}>
          Грузоперевозки
        </Text>
      </div>

      {/* Информация о пользователе */}
      <Dropdown menu={{ items }} trigger={['click']}>
        <Space style={{ cursor: 'pointer' }}>
          <Avatar icon={<UserOutlined />} />
          <Text>{user?.name || user?.email || 'Пользователь'}</Text>
        </Space>
      </Dropdown>
    </AntHeader>
  );
};

export default AppHeader;
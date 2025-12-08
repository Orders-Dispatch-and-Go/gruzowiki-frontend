import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Descriptions, Spin, Alert, Space, Typography, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../api/users';

const { Title } = Typography;

const ShipperProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      const userResponse = await usersApi.getCurrentUser();
      setUserData(userResponse);

    } catch (err: any) {
      setError('Ошибка загрузки данных пользователя');
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  useEffect(() => {
    // Загружаем данные только если их еще нет
    if (!userData && user?.id) {
      loadUserData();
    }
  }, [userData, user?.id, loadUserData]);

  const handleEditClick = () => {
    message.info('Функция изменения данных будет доступна в следующем обновлении');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Ошибка"
        description={error}
        type="error"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2}>Личный кабинет</Title>
        
        <Card 
          title="Информация о пользователе"
          extra={
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={handleEditClick}
              disabled
            >
              Изменить сведения
            </Button>
          }
        >
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Фамилия">
              {user?.lastName || userData?.secondName || 'Не указано'}
            </Descriptions.Item>
            <Descriptions.Item label="Имя">
              {user?.firstName || userData?.firstName || 'Не указано'}
            </Descriptions.Item>
            <Descriptions.Item label="Отчество">
              {user?.middleName || userData?.thirdName || 'Не указано'}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {user?.email || userData?.email || 'Не указано'}
            </Descriptions.Item>
            <Descriptions.Item label="Телефон">
              {user?.phone || userData?.phone || 'Не указано'}
            </Descriptions.Item>
            <Descriptions.Item label="Дата рождения">
              {user?.birthDate || (userData?.birthdate ? new Date(userData.birthdate).toLocaleDateString('ru-RU') : 'Не указана')}
            </Descriptions.Item>
            <Descriptions.Item label="Роль">
              {user?.role === "ROLE_CONSIGNER" ? 'Грузоотправитель' : 'Грузоперевозчик'}
            </Descriptions.Item>
            {user?.role === 'ROLE_CARRIER' && (
              <Descriptions.Item label="Категории прав">
                {user?.licenseCategories || userData?.licenseCategories || 'Не указаны'}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      </Space>
    </div>
  );
};

export default ShipperProfilePage;
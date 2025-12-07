import type React from "react";
import {
  Layout,
  Card,
  Button,
  Space,
  Typography,
  Alert,
} from "antd";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const ConsignerPlaceholderPage : React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    
    return (
        <Content style={{padding: "24px"}}>
           <Card style={{ maxWidth: 600, textAlign: 'center' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2}>🚚 Панель грузоперевозчика</Title>
          
          <Alert 
            type="info" 
            message="В разработке"
            description="Панель для грузоперевозчиков находится в разработке"
            showIcon
          />
          
          <Paragraph>
            Привет, <Text strong>{user?.name || user?.email}</Text>!
          </Paragraph>
          
          <Paragraph type="secondary">
            Ты вошёл как <Text code>грузоперевозчик (ROLE_CARRIER)</Text>.
            <br />
            Эта часть системы пока не готова, но мы активно над ней работаем.
          </Paragraph>
          
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Button 
              type="primary" 
              onClick={() => logout()}
              danger
            >
              Выйти из системы
            </Button>
            
            <Button 
              onClick={() => navigate('/')}
            >
              На главную
            </Button>
          </div>
        </Space>
      </Card> 
        </Content>
    )
}

export default ConsignerPlaceholderPage;
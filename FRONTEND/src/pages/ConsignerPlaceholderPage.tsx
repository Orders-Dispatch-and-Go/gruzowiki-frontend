import type React from "react";
import { Layout, Card, Button, Space, Typography, Alert, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const ConsignerPlaceholderPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    return (
            <Content style={{ padding: "24px" }}>
{/* Заголовок и кнопки действий */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col span={24}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Title level={2}>Страница в разработке</Title>
            
            
          </Space>
        </Col>
      </Row>

                <Card style={{ maxWidth: 600, textAlign: "center" }}>
                    <Space
                        direction="vertical"
                        size="large"
                        style={{ width: "100%" }}
                    >

                        <Paragraph>
                            Данная страница временно недоступна. Пожалуйста, воспользуйтесь нашим
                            мобильным приложением для оформления грузоперевозок.
                        </Paragraph>


                        <div
                            style={{
                                display: "flex",
                                gap: 16,
                                justifyContent: "center",
                            }}
                        >
                            <Button
                                type="primary"
                                onClick={() => logout()}
                                danger
                            >
                                Назад
                            </Button>

                        </div>
                    </Space>
                </Card>
            </Content>
    );
};

export default ConsignerPlaceholderPage;

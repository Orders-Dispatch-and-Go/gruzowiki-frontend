import { useParams, Link } from "react-router-dom";
import { Card, Typography, Button } from "antd";

export default function RequestCreatedPage() {
    const { id } = useParams();

    return (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 50 }}>
            <Card style={{ width: 500, textAlign: "center" }}>
                <Typography.Title level={2} style={{ color: "green" }}>
                    Заявка успешно создана!
                </Typography.Title>

                <Typography.Paragraph style={{ fontSize: 18 }}>
                    Ваш код заявки:
                </Typography.Paragraph>

                <Typography.Title level={3} style={{ marginTop: -10 }}>
                    {id}
                </Typography.Title>

                <Typography.Paragraph type="secondary" style={{ marginTop: 15 }}>
                    Запомните или запишите этот код обязательно.
                </Typography.Paragraph>

                <Button type="primary" size="large">
                    <Link to="/shipper/home">На главную</Link>
                </Button>
            </Card>
        </div>
    );
}

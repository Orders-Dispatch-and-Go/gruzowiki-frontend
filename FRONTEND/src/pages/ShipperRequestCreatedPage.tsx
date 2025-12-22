import { useParams, Link } from "react-router-dom";
import { Card, Typography, Button } from "antd";

export default function RequestCreatedPage() {
    const { id } = useParams();

    return (
        <div
            style={{ display: "flex", justifyContent: "center", marginTop: 50 }}
        >
            <Card
                style={{
                    width: 500,
                    textAlign: "center",
                    borderColor: "#293645",
                    borderRadius: 32,
                }}
                bodyStyle={{
                    borderColor: "#293645",
                    borderRadius: 32,
                }}
            >
                <Typography.Title level={2} style={{ color: "#ffffff" }}>
                    Заявка успешно создана!
                </Typography.Title>

                <Typography.Paragraph
                    style={{ fontSize: 18, color: "#ffffff" }}
                >
                    Ваш код заявки:
                </Typography.Paragraph>

                <Typography.Title
                    level={3}
                    style={{ marginTop: -10, color: "#ffffff" }}
                >
                    {id}
                </Typography.Title>

                <Typography.Paragraph
                    type="secondary"
                    style={{ marginTop: 15, color: "#ffffff" }}
                >
                    Запомните или запишите этот код обязательно.
                </Typography.Paragraph>

                <Button
                    type="primary"
                    size="large"
                    style={{
                        backgroundColor: "#FAAD14",
                        borderColor: "#FAAD14",
                    }}
                >
                    <Link to="/shipper/home">На главную</Link>
                </Button>
            </Card>
        </div>
    );
}

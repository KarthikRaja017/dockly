import { Layout, Progress, Button, Card, Row, Col } from 'antd';

const { Content } = Layout;

const Dashboard = () => {
  return (
    <Layout style={{ marginLeft: 220 }}>
      <Content style={{ padding: '24px' }}>
        <h2>John's Dock</h2>
        <p>You have 3 accounts that need attention and 2 bills due this week.</p>

        <Card style={{ marginBottom: 24 }}>
          <h3>Account Setup</h3>
          <p>Continue setup: 13/20 steps completed</p>
          <Progress percent={65} showInfo={true} strokeColor="#1A73E8" />
          <Button type="primary" style={{ marginTop: 12 }}>Complete Setup</Button>
        </Card>

        <Row gutter={16}>
          <Col span={8}>
            <Card title="Password Health">
              <p style={{ color: 'red' }}>🔴 3 accounts using weak passwords</p>
              <p style={{ color: 'orange' }}>🟠 2 accounts with repeated passwords</p>
              <p style={{ color: 'green' }}>🟢 29 accounts with strong passwords</p>
              <Button type="link">View Recommendations</Button>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Document Status">
              <p style={{ color: 'orange' }}>🟠 Passport expires in 45 days</p>
              <p style={{ color: 'red' }}>🔴 Car registration expired 3 days ago</p>
              <p style={{ color: 'green' }}>🟢 27 documents up to date</p>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Subscription Monitor">
              <p style={{ color: '#1A73E8' }}>🔵 14 active subscriptions</p>
              <p style={{ color: 'orange' }}>🟠 Total monthly cost: $217.43</p>
              <p style={{ color: 'green' }}>🟢 All payments on auto-pay</p>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Dashboard;

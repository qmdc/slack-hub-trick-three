import React, { useState } from 'react';
import { Button, Card, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const TestPage: React.FC = () => {
    const [count, setCount] = useState(0);

    const handleClick = () => {
        console.log('Button clicked!');
        setCount(count + 1);
        message.success('按钮点击成功！');
    };

    return (
        <Card title="测试页面" extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleClick}>点击测试</Button>}>
            <div style={{ fontSize: '24px', padding: '20px' }}>
                点击次数: {count}
            </div>
            <Button onClick={handleClick}>普通按钮测试</Button>
        </Card>
    );
};

export default TestPage;
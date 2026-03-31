import React, { useState } from 'react';
import { Paper, TextInput, PasswordInput, Button, Title, Text, Container, Group, Anchor, Checkbox, LoadingOverlay, Box } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import type { AuthUser } from '../../store/authStore';
import { IconReportSearch } from '@tabler/icons-react';
import api from '../../lib/axios';
import { notifications } from '@mantine/notifications';

type LoginRole = {
  name: string;
};

type LoginResponse = {
  access_token: string;
  permissions?: string[];
  user: AuthUser & {
    roles?: LoginRole[];
  };
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data } = await api.post<LoginResponse>('/auth/login', { username, password });
      const roles = data.user.roles?.map((role) => role.name) || [];
      const permissions = data.permissions || [];
      
      setAuth(data.user, data.access_token, roles, permissions);
      
      notifications.show({
        title: '登录成功',
        message: `欢迎回来, ${data.user.username}`,
        color: 'green'
      });
      
      navigate('/');
    } catch (err: unknown) {
      notifications.show({
        title: '登录失败',
        message: (err as ApiError | undefined)?.response?.data?.message || '账号或密码错误',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #ebfbee 0%, #d3f9d8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Container size={420} my={40}>
        <Title ta="center" c="green.9" fw={900}>
          <IconReportSearch size={48} style={{ marginBottom: -8, marginRight: 8 }} />
          雷犀质检
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          新一代智能客服质量管理平台
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md" pos="relative">
          <LoadingOverlay visible={loading} overlayProps={{ radius: "sm", blur: 2 }} />
          
          <form onSubmit={handleLogin}>
            <TextInput 
              label="账号" 
              placeholder="请输入用户名" 
              required 
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
            />
            <PasswordInput 
              label="密码" 
              placeholder="请输入密码" 
              required 
              mt="md" 
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
            
            <Group justify="space-between" mt="lg">
              <Checkbox label="记住我" color="green" />
              <Anchor component="button" size="sm" c="green" type="button">
                忘记密码？
              </Anchor>
            </Group>
            
            <Button fullWidth mt="xl" type="submit" color="green">
              立即登录
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}

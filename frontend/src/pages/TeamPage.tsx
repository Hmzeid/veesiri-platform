import { useState } from 'react';
import { Card, Table, Tag, Button, Space, Input, Select, Modal, Form, message, Typography, Avatar } from 'antd';
import { UserAddOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';

const ROLES = ['ADMIN', 'ASSESSOR', 'QUALITY_MANAGER', 'VIEWER'] as const;
const ROLE_COLOR: Record<string, string> = {
  ADMIN: 'red', ASSESSOR: 'blue', QUALITY_MANAGER: 'green', VIEWER: 'default',
};

export default function TeamPage() {
  const { factoryId } = useParams();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data } = useQuery<any[]>({
    queryKey: ['team', factoryId],
    queryFn: async () => (await api.get(`/factories/${factoryId}/team`)).data,
  });

  const invite = useMutation({
    mutationFn: async (dto: { email: string; role: string }) =>
      (await api.post(`/factories/${factoryId}/team`, dto)).data,
    onSuccess: () => {
      message.success('Team member invited');
      setModalOpen(false);
      form.resetFields();
      qc.invalidateQueries({ queryKey: ['team', factoryId] });
    },
    onError: (e: any) => message.error(e.response?.data?.message || 'Failed to invite'),
  });

  const remove = useMutation({
    mutationFn: async (userId: string) =>
      (await api.delete(`/factories/${factoryId}/team/${userId}`)).data,
    onSuccess: () => {
      message.success('Team member removed');
      qc.invalidateQueries({ queryKey: ['team', factoryId] });
    },
    onError: (e: any) => message.error(e.response?.data?.message || 'Failed to remove'),
  });

  const changeRole = useMutation({
    mutationFn: async (dto: { userId: string; role: string }) =>
      (await api.put(`/factories/${factoryId}/team/${dto.userId}/role`, { role: dto.role })).data,
    onSuccess: () => {
      message.success('Role updated');
      qc.invalidateQueries({ queryKey: ['team', factoryId] });
    },
  });

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <TeamOutlined style={{ fontSize: 24, color: '#006C35' }} />
            <div>
              <Typography.Title level={3} style={{ margin: 0 }}>Team</Typography.Title>
              <Typography.Text type="secondary">Manage who can access this factory's data.</Typography.Text>
            </div>
          </Space>
          <Button type="primary" icon={<UserAddOutlined />} onClick={() => setModalOpen(true)}>
            Invite member
          </Button>
        </Space>
      </Card>

      <Card>
        <Table
          rowKey="id"
          dataSource={data ?? []}
          pagination={false}
          columns={[
            {
              title: 'Member',
              render: (_: any, row: any) => (
                <Space>
                  <Avatar style={{ background: '#1A2F4E' }}>
                    {(row.user.nameEn || row.user.email).charAt(0).toUpperCase()}
                  </Avatar>
                  <div>
                    <div style={{ fontWeight: 600 }}>{row.user.nameEn || row.user.email.split('@')[0]}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{row.user.email}</div>
                  </div>
                </Space>
              ),
            },
            {
              title: 'Role',
              dataIndex: 'role',
              render: (role: string, row: any) => (
                <Select
                  value={role}
                  style={{ width: 160 }}
                  options={ROLES.map((r) => ({ value: r, label: r }))}
                  onChange={(v) => changeRole.mutate({ userId: row.user.id, role: v })}
                />
              ),
            },
            {
              title: 'Status',
              dataIndex: 'acceptedAt',
              render: (a: string) => a ? <Tag color="green">Active</Tag> : <Tag>Pending</Tag>,
            },
            {
              title: 'Invited',
              dataIndex: 'invitedAt',
              render: (d: string) => new Date(d).toLocaleDateString(),
            },
            {
              title: '',
              render: (_: any, row: any) => (
                <Button icon={<DeleteOutlined />} danger size="small"
                  onClick={() => Modal.confirm({
                    title: 'Remove member?',
                    onOk: () => remove.mutate(row.user.id),
                  })}
                >
                  Remove
                </Button>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={modalOpen}
        title="Invite a team member"
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={invite.isPending}
        okText="Send invite"
      >
        <Form form={form} layout="vertical" onFinish={(v) => invite.mutate(v)} initialValues={{ role: 'VIEWER' }}>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="member@factory.sa" />
          </Form.Item>
          <Form.Item name="role" label="Role">
            <Select
              options={[
                { value: 'ADMIN', label: 'Admin (full control)' },
                { value: 'ASSESSOR', label: 'Assessor (complete assessment)' },
                { value: 'QUALITY_MANAGER', label: 'Quality Manager (evidence + review)' },
                { value: 'VIEWER', label: 'Viewer (read-only)' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

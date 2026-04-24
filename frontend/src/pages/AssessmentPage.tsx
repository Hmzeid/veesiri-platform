import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Col, Row, Slider, Typography, Button, Input, Space, Tag, Progress, message, Modal, Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

type Question = {
  id: string;
  dimensionCode: string;
  dimensionNameAr: string;
  dimensionNameEn: string;
  buildingBlock: 'PROCESS' | 'TECHNOLOGY' | 'ORGANIZATION';
  pillar: string;
  questionAr: string;
  questionEn: string;
  level0DescriptorEn: string; level0DescriptorAr: string;
  level1DescriptorEn: string; level1DescriptorAr: string;
  level2DescriptorEn: string; level2DescriptorAr: string;
  level3DescriptorEn: string; level3DescriptorAr: string;
  level4DescriptorEn: string; level4DescriptorAr: string;
  level5DescriptorEn: string; level5DescriptorAr: string;
};

type DimensionResponse = {
  id: string;
  dimensionCode: string;
  rawScore: number;
  notesEn: string | null;
  notesAr: string | null;
};

type Assessment = {
  id: string;
  status: string;
  questions: Question[];
  responses: DimensionResponse[];
};

const BLOCK_ORDER = ['PROCESS', 'TECHNOLOGY', 'ORGANIZATION'] as const;

export default function AssessmentPage() {
  const { assessmentId, factoryId } = useParams();
  const { t, i18n } = useTranslation();
  const nav = useNavigate();
  const qc = useQueryClient();
  const isAr = i18n.language === 'ar';
  const [activeCode, setActiveCode] = useState<string | null>(null);

  const { data: assessment, isLoading } = useQuery<Assessment>({
    queryKey: ['assessment', assessmentId],
    queryFn: async () => (await api.get(`/assessments/${assessmentId}`)).data,
  });

  const responseMap = useMemo(() => {
    const m = new Map<string, DimensionResponse>();
    assessment?.responses?.forEach((r) => m.set(r.dimensionCode, r));
    return m;
  }, [assessment]);

  const current = useMemo(() => {
    if (!assessment) return null;
    const code = activeCode ?? assessment.questions[0]?.dimensionCode;
    return assessment.questions.find((q) => q.dimensionCode === code) ?? assessment.questions[0];
  }, [assessment, activeCode]);

  const saveMut = useMutation({
    mutationFn: async (payload: { code: string; rawScore: number; notesEn?: string; notesAr?: string }) => {
      return (
        await api.put(`/assessments/${assessmentId}/dimensions/${payload.code}`, {
          rawScore: payload.rawScore,
          notesEn: payload.notesEn,
          notesAr: payload.notesAr,
        })
      ).data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assessment', assessmentId] });
      message.success(t('assessment.saved'));
    },
  });

  const submitMut = useMutation({
    mutationFn: async () => (await api.post(`/assessments/${assessmentId}/submit`)).data,
    onSuccess: async () => {
      message.success(t('assessment.submitted'));
      await api.post('/gap-analysis', { assessmentId });
      nav(`/app/factories/${factoryId}/gap-analysis`);
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Submit failed');
    },
  });

  if (isLoading || !assessment || !current) return <Card loading />;

  if (assessment.questions.length === 0) {
    return (
      <Card>
        <Empty description="Question bank is empty. Run npm run db:seed." />
      </Card>
    );
  }

  const completed = assessment.responses.length;
  const total = assessment.questions.length;
  const currentResponse = responseMap.get(current.dimensionCode);
  const isLocked = assessment.status === 'SUBMITTED' || assessment.status === 'CERTIFIED';

  const descriptorAt = (level: number) => {
    const key = `level${level}Descriptor${isAr ? 'Ar' : 'En'}` as keyof Question;
    return String(current[key]);
  };

  const confirmSubmit = () => {
    Modal.confirm({
      title: t('assessment.submit'),
      content: t('assessment.submitConfirm'),
      okText: t('common.submit'),
      cancelText: t('common.cancel'),
      onOk: () => submitMut.mutate(),
    });
  };

  return (
    <Row gutter={16}>
      <Col xs={24} md={8}>
        <Card
          title={
            <Space direction="vertical" size={0}>
              <Typography.Text strong>{t('assessment.title')}</Typography.Text>
              <Typography.Text type="secondary">
                {completed} / {total}
              </Typography.Text>
            </Space>
          }
          bodyStyle={{ padding: 0, maxHeight: 620, overflow: 'auto' }}
        >
          {BLOCK_ORDER.map((block) => {
            const qs = assessment.questions.filter((q) => q.buildingBlock === block);
            if (qs.length === 0) return null;
            return (
              <div key={block}>
                <div style={{ padding: '12px 16px', background: '#f3f4f6', fontWeight: 600 }}>
                  {t(`buildingBlock.${block}`)}
                </div>
                {qs.map((q) => {
                  const r = responseMap.get(q.dimensionCode);
                  const active = current.dimensionCode === q.dimensionCode;
                  return (
                    <div
                      key={q.id}
                      onClick={() => setActiveCode(q.dimensionCode)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f0f0f0',
                        cursor: 'pointer',
                        background: active ? '#e6f3ec' : '#fff',
                      }}
                    >
                      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                        <Space direction="vertical" size={0}>
                          <Typography.Text strong>{q.dimensionCode}</Typography.Text>
                          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            {isAr ? q.dimensionNameAr : q.dimensionNameEn}
                          </Typography.Text>
                        </Space>
                        {r ? <Tag color="green">{r.rawScore}</Tag> : <Tag>—</Tag>}
                      </Space>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </Card>
      </Col>

      <Col xs={24} md={16}>
        <Card>
          <Progress percent={Math.round((completed / total) * 100)} status="active" />
          <Space direction="vertical" style={{ width: '100%', marginTop: 16 }} size="large">
            <Space size="small">
              <Tag color="blue">{t(`buildingBlock.${current.buildingBlock}`)}</Tag>
              <Tag>{t(`pillar.${current.pillar}`)}</Tag>
              <Tag color="gold">{current.dimensionCode}</Tag>
            </Space>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {isAr ? current.dimensionNameAr : current.dimensionNameEn}
            </Typography.Title>
            <Typography.Paragraph type="secondary">
              {isAr ? current.questionAr : current.questionEn}
            </Typography.Paragraph>

            <DimensionForm
              key={current.dimensionCode}
              code={current.dimensionCode}
              descriptorAt={descriptorAt}
              initial={currentResponse}
              disabled={isLocked}
              onSave={(payload) => saveMut.mutate({ code: current.dimensionCode, ...payload })}
              saving={saveMut.isPending}
              labels={{
                selectLevel: t('assessment.selectLevel'),
                save: t('assessment.save'),
                notesEn: t('assessment.notesEn'),
                notesAr: t('assessment.notesAr'),
              }}
            />
          </Space>
        </Card>

        <Card style={{ marginTop: 16, background: '#fafafa' }}>
          <Space style={{ justifyContent: 'space-between', width: '100%' }}>
            <Typography.Text type="secondary">
              {completed} / {total} dimensions scored
            </Typography.Text>
            <Button
              type="primary"
              disabled={completed < total || isLocked}
              onClick={confirmSubmit}
              loading={submitMut.isPending}
            >
              {t('assessment.submit')}
            </Button>
          </Space>
          {completed < total && (
            <Typography.Text type="warning" style={{ display: 'block', marginTop: 8 }}>
              {t('assessment.incomplete')}
            </Typography.Text>
          )}
        </Card>
      </Col>
    </Row>
  );
}

function DimensionForm({
  code,
  descriptorAt,
  initial,
  onSave,
  saving,
  disabled,
  labels,
}: {
  code: string;
  descriptorAt: (level: number) => string;
  initial?: DimensionResponse;
  onSave: (p: { rawScore: number; notesEn?: string; notesAr?: string }) => void;
  saving: boolean;
  disabled: boolean;
  labels: { selectLevel: string; save: string; notesEn: string; notesAr: string };
}) {
  const [score, setScore] = useState<number>(initial?.rawScore ?? 0);
  const [notesEn, setNotesEn] = useState<string>(initial?.notesEn ?? '');
  const [notesAr, setNotesAr] = useState<string>(initial?.notesAr ?? '');

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <div>
        <Typography.Text strong>{labels.selectLevel}</Typography.Text>
        <Slider
          min={0}
          max={5}
          step={1}
          value={score}
          onChange={(v) => setScore(v)}
          marks={{ 0: '0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' }}
          disabled={disabled}
        />
        <div
          style={{
            padding: 12,
            background: '#e6f3ec',
            borderRadius: 8,
            borderInlineStart: '4px solid #006C35',
          }}
        >
          <Typography.Text strong style={{ color: '#006C35' }}>
            Level {score}:{' '}
          </Typography.Text>
          <Typography.Text>{descriptorAt(score)}</Typography.Text>
        </div>
      </div>
      <Row gutter={12}>
        <Col xs={24} md={12}>
          <Typography.Text type="secondary">{labels.notesEn}</Typography.Text>
          <Input.TextArea rows={3} value={notesEn} onChange={(e) => setNotesEn(e.target.value)} disabled={disabled} />
        </Col>
        <Col xs={24} md={12}>
          <Typography.Text type="secondary">{labels.notesAr}</Typography.Text>
          <Input.TextArea rows={3} value={notesAr} onChange={(e) => setNotesAr(e.target.value)} disabled={disabled} />
        </Col>
      </Row>
      <Button
        type="primary"
        onClick={() => onSave({ rawScore: score, notesEn, notesAr })}
        loading={saving}
        disabled={disabled}
      >
        {labels.save}
      </Button>
    </Space>
  );
}

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Background } from '../components/Background';
import { Card, Chip, GhostButton, SectionTitle } from '../components/ui';
import { colors, fonts, radius, spacing, withAlpha } from '../theme';

const NORMS: { id: string; name: string; year: string; line: string; tone: string; moduleId?: string }[] = [
  {
    id: 'crm',
    name: 'Constituição da República',
    year: '2004 · rev. 2018',
    line: 'Separação de poderes; arts. 130.º, 131.º e 228.º–230.º.',
    tone: '#2ED8FF',
    moduleId: 'm1',
  },
  {
    id: 'sistafe',
    name: 'Lei 9/2002 — Lei do SISTAFE',
    year: '12 de Fevereiro',
    line: 'Fases da receita e da despesa; controlo interno (arts. 62.º e 64.º).',
    tone: '#27E08A',
    moduleId: 'm2',
  },
  {
    id: 'rev',
    name: 'Lei 14/2020 — Revisão do SISTAFE',
    year: '23 de Dezembro',
    line: 'Prazos da CGE: entrega até 30/04, parecer até 30/09.',
    tone: '#7A5CFF',
    moduleId: 'm4',
  },
  {
    id: 'ta',
    name: 'Lei 26/2009 — Orgânica do TA',
    year: '29 de Setembro',
    line: 'Fiscalização prévia, concomitante e sucessiva; julgamento de contas.',
    tone: '#C04CFF',
    moduleId: 'm3',
  },
  {
    id: 'visto',
    name: 'Lei 13/97 — Fiscalização Prévia',
    year: '10 de Julho',
    line: 'Regime do Visto sobre actos e contratos.',
    tone: '#FFB020',
    moduleId: 'm3',
  },
  {
    id: 'dm',
    name: 'D.M. 181/2013 — Manual de Administração Financeira',
    year: 'Procedimentos do e-SISTAFE',
    line: 'Conformidades processual e documental; perfis ACI, AEO e AEF.',
    tone: '#2ED8FF',
    moduleId: 'm2',
  },
];

const GLOSSARY: { term: string; line: string }[] = [
  { term: 'Cabimento', line: 'Cativa verba antes de assumir o encargo.' },
  { term: 'Liquidação', line: 'Apura o valor exacto e emite a ordem de pagamento.' },
  { term: 'Pagamento', line: 'Entrega o dinheiro e extingue a obrigação.' },
  { term: 'Visto', line: 'Controlo prévio do TA sobre contratos.' },
  { term: 'CGE', line: 'Conta Geral do Estado: o retrato anual da execução.' },
  { term: 'ACI', line: 'Agente de Controlo Interno no e-SISTAFE.' },
  { term: 'Parecer', line: 'Certificação do TA sobre a CGE.' },
  { term: 'Infracção financeira', line: 'Gera reposição e multa.' },
];

export function LibraryScreen({
  onBack,
  onOpenModule,
}: {
  onBack: () => void;
  onOpenModule: (moduleId: string) => void;
}) {
  return (
    <Background accent={colors.neonViolet}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <GhostButton label="← Voltar" onPress={onBack} style={{ alignSelf: 'flex-start' }} />
        <Text style={styles.kicker}>BIBLIOTECA RÁPIDA</Text>
        <Text style={styles.title}>Normas & Termos</Text>
        <Text style={styles.subtitle}>Uma linha por norma. Sem textão — depois praticas no quiz.</Text>

        <SectionTitle hint="toca para praticar">Base legal</SectionTitle>
        {NORMS.map((norm) => (
          <Pressable
            key={norm.id}
            onPress={() => norm.moduleId && onOpenModule(norm.moduleId)}
            style={[styles.card, { borderColor: withAlpha(norm.tone, 0.35) }]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{norm.name}</Text>
              <Chip label={norm.year} tone={norm.tone} />
            </View>
            <Text style={styles.cardLine}>{norm.line}</Text>
            {norm.moduleId ? <Text style={[styles.practice, { color: norm.tone }]}>PRATICAR →</Text> : null}
          </Pressable>
        ))}

        <SectionTitle>Glossário relâmpago</SectionTitle>
        <Card style={{ gap: spacing.md }}>
          {GLOSSARY.map((item) => (
            <View key={item.term} style={styles.glossRow}>
              <Text style={styles.glossTerm}>{item.term}</Text>
              <Text style={styles.glossLine}>{item.line}</Text>
            </View>
          ))}
        </Card>

        <Card style={{ marginTop: spacing.lg, gap: 4 }}>
          <Text style={styles.disclaimer}>
            Conteúdo formativo resumido para estudo. Em caso de dúvida, prevalece o texto legal publicado no Boletim da
            República.
          </Text>
        </Card>
      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl * 2,
    paddingBottom: spacing.xxl * 2,
    gap: spacing.sm,
  },
  kicker: {
    color: colors.titaniumDark,
    fontSize: 10,
    fontFamily: fonts.black,
    letterSpacing: 1.4,
  },
  title: {
    color: colors.white,
    fontSize: 26,
    fontFamily: fonts.black,
  },
  subtitle: {
    color: colors.titanium,
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: 6,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardTitle: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  cardLine: {
    color: colors.titanium,
    fontSize: 12,
    fontFamily: fonts.medium,
    lineHeight: 17,
  },
  practice: {
    fontSize: 10,
    fontFamily: fonts.black,
    letterSpacing: 1.2,
    marginTop: 2,
  },
  glossRow: {
    gap: 2,
  },
  glossTerm: {
    color: colors.white,
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  glossLine: {
    color: colors.titanium,
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  disclaimer: {
    color: colors.titaniumDark,
    fontSize: 10,
    fontFamily: fonts.medium,
    lineHeight: 15,
  },
});

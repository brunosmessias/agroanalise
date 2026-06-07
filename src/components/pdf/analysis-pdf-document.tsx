import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { RouterOutputs } from "~/trpc/react";

type AnalysisData = NonNullable<RouterOutputs["analyses"]["getBySlug"]>;

Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hiA.ttf",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hiA.ttf",
      fontWeight: 700,
    },
  ],
});

const colors = {
  primary: "#16a34a",
  primaryLight: "#dcfce7",
  text: "#1c1917",
  textSecondary: "#78716c",
  border: "#e7e5e4",
  bg: "#fafaf9",
  white: "#ffffff",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 10,
    color: colors.text,
    padding: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderBottom: `1px solid ${colors.border}`,
  },
  headerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerLogoText: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.primary,
  },
  headerSubtitle: {
    fontSize: 8,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerDate: {
    fontSize: 8,
    color: colors.textSecondary,
  },

  coverSection: {
    paddingHorizontal: 40,
    paddingTop: 32,
    paddingBottom: 24,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: 600,
    color: colors.white,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1.2,
    color: colors.text,
    maxWidth: "80%",
  },
  description: {
    fontSize: 11,
    lineHeight: 1.6,
    color: colors.textSecondary,
    marginTop: 10,
    maxWidth: "85%",
  },
  coverMeta: {
    flexDirection: "row",
    gap: 20,
    marginTop: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaLabel: {
    fontSize: 7,
    fontWeight: 600,
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
  metaValue: {
    fontSize: 9,
    fontWeight: 600,
    color: colors.text,
  },

  statsStrip: {
    flexDirection: "row",
    marginHorizontal: 40,
    marginTop: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: "hidden",
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  statIconText: {
    fontSize: 10,
    fontWeight: 700,
    color: colors.primary,
  },
  statLabel: {
    fontSize: 7,
    fontWeight: 600,
    color: colors.textSecondary,
    letterSpacing: 0.6,
  },
  statValue: {
    fontSize: 9,
    fontWeight: 600,
    color: colors.text,
  },

  sectionTitle: {
    fontSize: 7,
    fontWeight: 700,
    color: colors.primary,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 700,
    color: colors.text,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 9,
    color: colors.textSecondary,
    lineHeight: 1.4,
  },
  sectionHeader: {
    paddingHorizontal: 40,
    marginBottom: 16,
  },

  photoGrid: {
    paddingHorizontal: 40,
  },
  photoRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  photoCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: "hidden",
  },
  photoImage: {
    width: "100%",
    height: 160,
    objectFit: "cover",
  },
  photoPlaceholder: {
    width: "100%",
    height: 160,
    backgroundColor: "#f5f5f4",
    alignItems: "center",
    justifyContent: "center",
  },
  photoPlaceholderText: {
    fontSize: 8,
    color: colors.textSecondary,
  },
  photoDesc: {
    padding: 8,
    fontSize: 9,
    lineHeight: 1.4,
    color: colors.text,
  },

  detailsSection: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 40,
    marginTop: 24,
  },
  farmCard: {
    flex: 3,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 20,
  },
  farmCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  farmCardIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  farmCardIconText: {
    fontSize: 10,
    fontWeight: 700,
    color: colors.primary,
  },
  farmCardTitle: {
    fontSize: 12,
    fontWeight: 700,
  },
  farmCardSubtitle: {
    fontSize: 8,
    color: colors.textSecondary,
  },
  fieldGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  field: {
    width: "47%",
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 7,
    fontWeight: 600,
    color: colors.textSecondary,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 10,
    fontWeight: 600,
  },
  notesBox: {
    marginTop: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: 6,
    padding: 10,
  },
  notesLabel: {
    fontSize: 7,
    fontWeight: 600,
    color: colors.textSecondary,
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  notesText: {
    fontSize: 9,
    lineHeight: 1.4,
  },

  agronomistCard: {
    flex: 2,
    borderRadius: 8,
    padding: 20,
    backgroundColor: colors.primary,
  },
  agronomistLabel: {
    fontSize: 7,
    fontWeight: 700,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1,
    marginBottom: 10,
  },
  agronomistInfo: {
    marginBottom: 12,
  },
  agronomistName: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.white,
  },
  agronomistCompany: {
    fontSize: 9,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  agronomistContact: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
    paddingTop: 10,
  },
  agronomistContactItem: {
    fontSize: 9,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 4,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 8,
    color: colors.textSecondary,
  },
  footerBrand: {
    fontSize: 8,
    fontWeight: 700,
    color: colors.primary,
  },
});

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function PhotoCard({ photo }: { photo: AnalysisData["photos"][number] }) {
  return (
    <View style={styles.photoCard}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image
        src={photo.imageUrl}
        style={styles.photoImage}
        cache={false}
      />
      {photo.description && (
        <Text style={styles.photoDesc}>{photo.description}</Text>
      )}
    </View>
  );
}

interface AnalysisPdfDocumentProps {
  data: AnalysisData;
}

export function AnalysisPdfDocument({ data }: AnalysisPdfDocumentProps) {
  const { title, description, visitDate, client, agronomist, photos } = data;

  const location = [client?.city, client?.state]
    .filter(Boolean)
    .join(" - ");
  const photoCount = photos.length;
  const formattedDate = formatDate(visitDate);
  const generatedDate = formatDate(new Date());

  const chunkedPhotos: AnalysisData["photos"][number][][] = [];
  for (let i = 0; i < photos.length; i += 2) {
    chunkedPhotos.push(photos.slice(i, i + 2));
  }

  return (
    <Document
      title={`Análise - ${title}`}
      author={agronomist?.name ?? "AgroAnalise"}
      subject="Relatório de Análise Agrícola"
      creator="AgroAnalise"
    >
      {/* Page 1: Cover + Stats + Photos start */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header} fixed>
          <View style={styles.headerBrand}>
            <Text style={styles.headerLogoText}>AgroAnalise</Text>
            <Text style={styles.headerSubtitle}>
              Relatório Técnico Agrícola
            </Text>
          </View>
          <Text style={styles.headerDate}>{formattedDate}</Text>
        </View>

        {/* Cover */}
        <View style={styles.coverSection}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>ANÁLISE</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}
          <View style={styles.coverMeta}>
            {client && (
              <View style={styles.metaItem}>
                <View>
                  <Text style={styles.metaLabel}>FAZENDA</Text>
                  <Text style={styles.metaValue}>{client.name}</Text>
                </View>
              </View>
            )}
            <View style={styles.metaItem}>
              <View>
                <Text style={styles.metaLabel}>DATA DA VISITA</Text>
                <Text style={styles.metaValue}>{formattedDate}</Text>
              </View>
            </View>
            {location && (
              <View style={styles.metaItem}>
                <View>
                  <Text style={styles.metaLabel}>LOCALIZAÇÃO</Text>
                  <Text style={styles.metaValue}>{location}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Stats Strip */}
        <View style={styles.statsStrip}>
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Text style={styles.statIconText}>D</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>DATA DA ANÁLISE</Text>
              <Text style={styles.statValue}>{formattedDate}</Text>
            </View>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Text style={styles.statIconText}>F</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>REGISTROS FOTOGRÁFICOS</Text>
              <Text style={styles.statValue}>
                {photoCount} foto{photoCount !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>
          <View style={[styles.statItem, { borderRightWidth: 0 }]}>
            <View style={styles.statIcon}>
              <Text style={styles.statIconText}>L</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>LOCALIZAÇÃO</Text>
              <Text style={styles.statValue}>{location ?? "Não informada"}</Text>
            </View>
          </View>
        </View>

        {/* Photos Section Header */}
        {photoCount > 0 && (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ANÁLISE FOTOGRÁFICA</Text>
            <Text style={styles.sectionHeading}>
              Registros fotográficos
            </Text>
            <Text style={styles.sectionDesc}>
              {photoCount} registro{photoCount !== 1 ? "s" : ""} fotográfico{photoCount !== 1 ? "s" : ""}, cada um com a descrição técnica do agrônomo.
            </Text>
          </View>
        )}

        {/* Photo Grid */}
        {chunkedPhotos.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.photoRow}>
            {row.map((photo, photoIdx) => (
              <PhotoCard
                key={photo.id ?? photoIdx}
                photo={photo}
              />
            ))}
            {row.length === 1 && <View style={{ flex: 1 }} />}
          </View>
        ))}

        {/* Farm Details + Agronomist — only on first page if space allows */}
        {(client ?? agronomist) && photoCount <= 2 && (
          <View style={styles.detailsSection}>
            {client && (
              <View style={styles.farmCard}>
                <View style={styles.farmCardHeader}>
                  <View style={styles.farmCardIcon}>
                    <Text style={styles.farmCardIconText}>F</Text>
                  </View>
                  <View>
                    <Text style={styles.farmCardTitle}>
                      Dados da Fazenda
                    </Text>
                    <Text style={styles.farmCardSubtitle}>
                      Propriedade e localização
                    </Text>
                  </View>
                </View>
                <View style={styles.fieldGrid}>
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>
                      NOME DA FAZENDA
                    </Text>
                    <Text style={styles.fieldValue}>
                      {client.name}
                    </Text>
                  </View>
                  {client.document && (
                    <View style={styles.field}>
                      <Text style={styles.fieldLabel}>CPF / CNPJ</Text>
                      <Text style={styles.fieldValue}>
                        {client.document}
                      </Text>
                    </View>
                  )}
                  {client.address && (
                    <View style={styles.field}>
                      <Text style={styles.fieldLabel}>ENDEREÇO</Text>
                      <Text style={styles.fieldValue}>
                        {client.address}
                        {location && `\n${location}`}
                      </Text>
                    </View>
                  )}
                  {client.phone && (
                    <View style={styles.field}>
                      <Text style={styles.fieldLabel}>TELEFONE</Text>
                      <Text style={styles.fieldValue}>
                        {client.phone}
                      </Text>
                    </View>
                  )}
                  {client.email && (
                    <View style={styles.field}>
                      <Text style={styles.fieldLabel}>EMAIL</Text>
                      <Text style={styles.fieldValue}>
                        {client.email}
                      </Text>
                    </View>
                  )}
                </View>
                {client.notes && (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesLabel}>OBSERVAÇÕES</Text>
                    <Text style={styles.notesText}>{client.notes}</Text>
                  </View>
                )}
              </View>
            )}
            {agronomist && (
              <View style={styles.agronomistCard}>
                <Text style={styles.agronomistLabel}>
                  RESPONSÁVEL TÉCNICO
                </Text>
                <View style={styles.agronomistInfo}>
                  <Text style={styles.agronomistName}>
                    {agronomist.name}
                  </Text>
                  {agronomist.company && (
                    <Text style={styles.agronomistCompany}>
                      {agronomist.company}
                    </Text>
                  )}
                </View>
                <View style={styles.agronomistContact}>
                  {agronomist.email && (
                    <Text style={styles.agronomistContactItem}>
                      {agronomist.email}
                    </Text>
                  )}
                  {agronomist.phone && (
                    <Text style={styles.agronomistContactItem}>
                      {agronomist.phone}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerBrand}>AgroAnalise</Text>
          <Text style={styles.footerText}>
            Relatório gerado em {generatedDate}
          </Text>
        </View>
      </Page>

      {/* Page 2+: Farm details + Agronomist (when photos took up page 1) */}
      {(client ?? agronomist) && photoCount > 2 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header} fixed>
            <View style={styles.headerBrand}>
              <Text style={styles.headerLogoText}>AgroAnalise</Text>
              <Text style={styles.headerSubtitle}>
                Relatório Técnico Agrícola
              </Text>
            </View>
            <Text style={styles.headerDate}>{formattedDate}</Text>
          </View>

          <View style={[styles.detailsSection, { marginTop: 32 }]}>
            {client && (
              <View style={styles.farmCard}>
                <View style={styles.farmCardHeader}>
                  <View style={styles.farmCardIcon}>
                    <Text style={styles.farmCardIconText}>F</Text>
                  </View>
                  <View>
                    <Text style={styles.farmCardTitle}>
                      Dados da Fazenda
                    </Text>
                    <Text style={styles.farmCardSubtitle}>
                      Propriedade e localização
                    </Text>
                  </View>
                </View>
                <View style={styles.fieldGrid}>
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>
                      NOME DA FAZENDA
                    </Text>
                    <Text style={styles.fieldValue}>
                      {client.name}
                    </Text>
                  </View>
                  {client.document && (
                    <View style={styles.field}>
                      <Text style={styles.fieldLabel}>CPF / CNPJ</Text>
                      <Text style={styles.fieldValue}>
                        {client.document}
                      </Text>
                    </View>
                  )}
                  {client.address && (
                    <View style={styles.field}>
                      <Text style={styles.fieldLabel}>ENDEREÇO</Text>
                      <Text style={styles.fieldValue}>
                        {client.address}
                        {location && `\n${location}`}
                      </Text>
                    </View>
                  )}
                  {client.phone && (
                    <View style={styles.field}>
                      <Text style={styles.fieldLabel}>TELEFONE</Text>
                      <Text style={styles.fieldValue}>
                        {client.phone}
                      </Text>
                    </View>
                  )}
                  {client.email && (
                    <View style={styles.field}>
                      <Text style={styles.fieldLabel}>EMAIL</Text>
                      <Text style={styles.fieldValue}>
                        {client.email}
                      </Text>
                    </View>
                  )}
                </View>
                {client.notes && (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesLabel}>OBSERVAÇÕES</Text>
                    <Text style={styles.notesText}>{client.notes}</Text>
                  </View>
                )}
              </View>
            )}
            {agronomist && (
              <View style={styles.agronomistCard}>
                <Text style={styles.agronomistLabel}>
                  RESPONSÁVEL TÉCNICO
                </Text>
                <View style={styles.agronomistInfo}>
                  <Text style={styles.agronomistName}>
                    {agronomist.name}
                  </Text>
                  {agronomist.company && (
                    <Text style={styles.agronomistCompany}>
                      {agronomist.company}
                    </Text>
                  )}
                </View>
                <View style={styles.agronomistContact}>
                  {agronomist.email && (
                    <Text style={styles.agronomistContactItem}>
                      {agronomist.email}
                    </Text>
                  )}
                  {agronomist.phone && (
                    <Text style={styles.agronomistContactItem}>
                      {agronomist.phone}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>

          <View style={styles.footer} fixed>
            <Text style={styles.footerBrand}>AgroAnalise</Text>
            <Text style={styles.footerText}>
              Relatório gerado em {generatedDate}
            </Text>
          </View>
        </Page>
      )}
    </Document>
  );
}

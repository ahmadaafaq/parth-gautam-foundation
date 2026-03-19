import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const PRESET_SKILLS = [
  'Communication', 'Teamwork', 'Problem Solving', 'MS Office', 'Leadership',
  'Time Management', 'Data Entry', 'Customer Service', 'Sales', 'Teaching',
  'Driving', 'Cooking', 'Tailoring', 'Computer Skills', 'Accounting',
  'Photography', 'Social Media', 'Hindi', 'English', 'Tally',
];

type WorkExp = { id: string; title: string; company: string; years: string };
type Education = { id: string; degree: string; institution: string; year: string };

const uid = () => Date.now().toString() + Math.random().toString(36).slice(2, 6);

// ─── Step Indicator ─────────────────────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={si.row}>
      {Array.from({ length: total }, (_, i) => (
        <React.Fragment key={i}>
          <View style={[si.dot, i < current && si.dotDone, i === current - 1 && si.dotActive]}>
            {i < current - 1 ? (
              <Ionicons name="checkmark" size={12} color="#fff" />
            ) : (
              <Text style={si.dotText}>{i + 1}</Text>
            )}
          </View>
          {i < total - 1 && <View style={[si.line, i < current - 1 && si.lineDone]} />}
        </React.Fragment>
      ))}
    </View>
  );
}
const si = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  dot: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  dotActive: { backgroundColor: '#3B82F6' },
  dotDone: { backgroundColor: '#10B981' },
  dotText: { fontSize: 12, fontWeight: '700', color: '#9CA3AF' },
  line: { flex: 1, height: 2, backgroundColor: '#E5E7EB', marginHorizontal: 4 },
  lineDone: { backgroundColor: '#10B981' },
});

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function ResumeBuilderScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1..4 = form steps, 5 = preview
  const TOTAL_STEPS = 4;

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [objective, setObjective] = useState('');

  const [workExps, setWorkExps] = useState<WorkExp[]>([
    { id: uid(), title: '', company: '', years: '' },
  ]);

  const [educations, setEducations] = useState<Education[]>([
    { id: uid(), degree: '', institution: '', year: '' },
  ]);

  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');

  // Work exp helpers
  const updateWork = (id: string, field: keyof WorkExp, value: string) =>
    setWorkExps((prev) => prev.map((w) => (w.id === id ? { ...w, [field]: value } : w)));
  const addWork = () =>
    setWorkExps((prev) => [...prev, { id: uid(), title: '', company: '', years: '' }]);
  const removeWork = (id: string) =>
    setWorkExps((prev) => prev.filter((w) => w.id !== id));

  // Education helpers
  const updateEdu = (id: string, field: keyof Education, value: string) =>
    setEducations((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  const addEdu = () =>
    setEducations((prev) => [...prev, { id: uid(), degree: '', institution: '', year: '' }]);
  const removeEdu = (id: string) =>
    setEducations((prev) => prev.filter((e) => e.id !== id));

  // Skills helpers
  const toggleSkill = (s: string) =>
    setSkills((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
      setCustomSkill('');
    }
  };

  const goNext = () => {
    if (step === 1 && !name.trim()) {
      Alert.alert('Required', 'Please enter your full name.'); return;
    }
    if (step < TOTAL_STEPS) setStep(step + 1);
    else setStep(5); // preview
  };

  const goBack = () => {
    if (step === 5) setStep(TOTAL_STEPS);
    else if (step > 1) setStep(step - 1);
    else router.back();
  };

  // ── PREVIEW ──
  if (step === 5) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#3B82F6', '#1D4ED8']} style={styles.bookingHeader}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerBarTitle}>Resume Preview</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
          {/* Resume Card */}
          <View style={styles.resumeCard}>
            {/* Header */}
            <LinearGradient colors={['#1E3A5F', '#3B82F6']} style={styles.resumeHeader}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarLetter}>{name.trim().charAt(0).toUpperCase() || '?'}</Text>
              </View>
              <Text style={styles.resumeName}>{name || 'Your Name'}</Text>
              {objective ? <Text style={styles.resumeObjective}>{objective}</Text> : null}
            </LinearGradient>

            {/* Contact */}
            <View style={styles.resumeSection}>
              <Text style={styles.resumeSectionTitle}>Contact</Text>
              {phone ? <ResumeRow icon="call-outline" value={phone} /> : null}
              {email ? <ResumeRow icon="mail-outline" value={email} /> : null}
              {city ? <ResumeRow icon="location-outline" value={city} /> : null}
            </View>

            {/* Work Experience */}
            {workExps.some((w) => w.title || w.company) && (
              <View style={styles.resumeSection}>
                <Text style={styles.resumeSectionTitle}>Work Experience</Text>
                {workExps.map((w) =>
                  w.title || w.company ? (
                    <View key={w.id} style={styles.resumeEntry}>
                      <Text style={styles.entryTitle}>{w.title || '—'}</Text>
                      <Text style={styles.entrySubtitle}>{w.company}{w.years ? ` • ${w.years}` : ''}</Text>
                    </View>
                  ) : null
                )}
              </View>
            )}

            {/* Education */}
            {educations.some((e) => e.degree || e.institution) && (
              <View style={styles.resumeSection}>
                <Text style={styles.resumeSectionTitle}>Education</Text>
                {educations.map((e) =>
                  e.degree || e.institution ? (
                    <View key={e.id} style={styles.resumeEntry}>
                      <Text style={styles.entryTitle}>{e.degree || '—'}</Text>
                      <Text style={styles.entrySubtitle}>{e.institution}{e.year ? ` • ${e.year}` : ''}</Text>
                    </View>
                  ) : null
                )}
              </View>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <View style={styles.resumeSection}>
                <Text style={styles.resumeSectionTitle}>Skills</Text>
                <View style={styles.skillsWrap}>
                  {skills.map((s) => (
                    <View key={s} style={styles.skillChipResume}>
                      <Text style={styles.skillChipResumeText}>{s}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.shareBtn}
            onPress={() => Alert.alert('Resume Saved!', 'Your resume has been created successfully.')}
          >
            <LinearGradient colors={['#10B981', '#059669']} style={styles.shareBtnGradient}>
              <Ionicons name="download-outline" size={20} color="#fff" />
              <Text style={styles.shareBtnText}>Save Resume</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── FORM STEPS ──
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#3B82F6', '#1D4ED8']} style={styles.bookingHeader}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerBarTitle}>Resume Builder</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <StepIndicator current={step} total={TOTAL_STEPS} />

      <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ─ Step 1: Personal Info ─ */}
        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>Personal Information</Text>
            <TextInput style={styles.input} placeholder="Full Name *" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="City / Location" value={city} onChangeText={setCity} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Career Objective (optional)"
              value={objective}
              onChangeText={setObjective}
              multiline
              numberOfLines={3}
            />
          </View>
        )}

        {/* ─ Step 2: Work Experience ─ */}
        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>Work Experience</Text>
            <Text style={styles.stepHint}>Leave blank if you're a fresher.</Text>
            {workExps.map((w, idx) => (
              <View key={w.id} style={styles.entryCard}>
                <View style={styles.entryCardHeader}>
                  <Text style={styles.entryCardLabel}>Experience {idx + 1}</Text>
                  {workExps.length > 1 && (
                    <TouchableOpacity onPress={() => removeWork(w.id)}>
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput style={styles.input} placeholder="Job Title" value={w.title} onChangeText={(v) => updateWork(w.id, 'title', v)} />
                <TextInput style={styles.input} placeholder="Company Name" value={w.company} onChangeText={(v) => updateWork(w.id, 'company', v)} />
                <TextInput style={styles.input} placeholder="Duration (e.g., 2020 – 2022)" value={w.years} onChangeText={(v) => updateWork(w.id, 'years', v)} />
              </View>
            ))}
            <TouchableOpacity style={styles.addRowBtn} onPress={addWork}>
              <Ionicons name="add-circle-outline" size={20} color="#3B82F6" />
              <Text style={styles.addRowText}>Add Another Experience</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ─ Step 3: Education ─ */}
        {step === 3 && (
          <View>
            <Text style={styles.stepTitle}>Education</Text>
            {educations.map((e, idx) => (
              <View key={e.id} style={styles.entryCard}>
                <View style={styles.entryCardHeader}>
                  <Text style={styles.entryCardLabel}>Education {idx + 1}</Text>
                  {educations.length > 1 && (
                    <TouchableOpacity onPress={() => removeEdu(e.id)}>
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput style={styles.input} placeholder="Degree / Course (e.g., B.Sc, 12th PCM)" value={e.degree} onChangeText={(v) => updateEdu(e.id, 'degree', v)} />
                <TextInput style={styles.input} placeholder="School / College / University" value={e.institution} onChangeText={(v) => updateEdu(e.id, 'institution', v)} />
                <TextInput style={styles.input} placeholder="Year of Passing" value={e.year} onChangeText={(v) => updateEdu(e.id, 'year', v)} keyboardType="numeric" />
              </View>
            ))}
            <TouchableOpacity style={styles.addRowBtn} onPress={addEdu}>
              <Ionicons name="add-circle-outline" size={20} color="#3B82F6" />
              <Text style={styles.addRowText}>Add Another Qualification</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ─ Step 4: Skills ─ */}
        {step === 4 && (
          <View>
            <Text style={styles.stepTitle}>Skills</Text>
            <Text style={styles.stepHint}>Tap to add. Add custom skills below.</Text>
            <View style={styles.skillsGrid}>
              {PRESET_SKILLS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.skillChip, skills.includes(s) && styles.skillChipActive]}
                  onPress={() => toggleSkill(s)}
                >
                  <Text style={[styles.skillChipText, skills.includes(s) && styles.skillChipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.customSkillRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Add custom skill..."
                value={customSkill}
                onChangeText={setCustomSkill}
                onSubmitEditing={addCustomSkill}
                returnKeyType="done"
              />
              <TouchableOpacity style={styles.addSkillBtn} onPress={addCustomSkill}>
                <Ionicons name="add" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
            {skills.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text style={styles.stepHint}>Selected ({skills.length}):</Text>
                <View style={styles.skillsGrid}>
                  {skills.filter((s) => !PRESET_SKILLS.includes(s)).map((s) => (
                    <TouchableOpacity key={s} style={styles.skillChipActive} onPress={() => toggleSkill(s)}>
                      <Text style={styles.skillChipTextActive}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Next / Preview Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
          <LinearGradient colors={['#3B82F6', '#1D4ED8']} style={styles.nextBtnGradient}>
            <Text style={styles.nextBtnText}>{step === TOTAL_STEPS ? 'Preview Resume' : 'Continue'}</Text>
            <Ionicons name={step === TOTAL_STEPS ? 'eye-outline' : 'arrow-forward'} size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function ResumeRow({ icon, value }: { icon: string; value: string }) {
  return (
    <View style={styles.resumeRow}>
      <Ionicons name={icon as any} size={14} color="#60A5FA" />
      <Text style={styles.resumeRowText}>{value}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  bookingHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 8, paddingBottom: 16, paddingHorizontal: 8,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', margin: 8,
  },
  headerBarTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },

  formContent: { padding: 16, paddingBottom: 32 },
  stepTitle: { fontSize: 20, fontWeight: '800', color: '#1F2937', marginBottom: 6 },
  stepHint: { fontSize: 13, color: '#6B7280', marginBottom: 16 },

  input: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    fontSize: 14, color: '#1F2937', marginBottom: 10,
    borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },

  entryCard: {
    backgroundColor: '#F3F4F6', borderRadius: 14, padding: 14, marginBottom: 12,
  },
  entryCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  entryCardLabel: { fontSize: 13, fontWeight: '700', color: '#374151' },

  addRowBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#EFF6FF', borderRadius: 12, padding: 12, marginTop: 4,
  },
  addRowText: { fontSize: 14, fontWeight: '600', color: '#3B82F6' },

  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  skillChip: {
    borderWidth: 1.5, borderColor: '#D1D5DB', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fff',
  },
  skillChipActive: {
    backgroundColor: '#3B82F6', borderColor: '#3B82F6',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  skillChipText: { fontSize: 13, color: '#374151', fontWeight: '600' },
  skillChipTextActive: { fontSize: 13, color: '#fff', fontWeight: '700' },

  customSkillRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  addSkillBtn: {
    width: 46, height: 46, borderRadius: 12, backgroundColor: '#3B82F6',
    alignItems: 'center', justifyContent: 'center',
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', padding: 16, paddingBottom: 24,
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  nextBtn: { borderRadius: 14, overflow: 'hidden' },
  nextBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 15,
  },
  nextBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  // Preview / Resume card
  resumeCard: {
    backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 6, marginBottom: 16,
  },
  resumeHeader: { padding: 24, alignItems: 'center' },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarLetter: { fontSize: 32, fontWeight: '800', color: '#fff' },
  resumeName: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  resumeObjective: { fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 19 },

  resumeSection: { padding: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  resumeSectionTitle: { fontSize: 12, fontWeight: '800', color: '#3B82F6', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 },

  resumeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  resumeRowText: { fontSize: 13, color: '#374151' },

  resumeEntry: { marginBottom: 10 },
  entryTitle: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  entrySubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },

  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  skillChipResume: {
    backgroundColor: '#EFF6FF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  skillChipResumeText: { fontSize: 12, fontWeight: '600', color: '#1D4ED8' },

  shareBtn: { borderRadius: 14, overflow: 'hidden' },
  shareBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 15,
  },
  shareBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

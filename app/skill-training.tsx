import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Animated,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// ─── Mock Data ──────────────────────────────────────────────────────────────────
const COURSES = [
  {
    id: '1',
    title: 'Digital Marketing Fundamentals',
    description: 'Learn the basics of digital marketing — SEO, social media, Google Ads, and content strategy — to grow any business online.',
    thumbnail: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=600&q=80',
    instructor: 'Aarav Singh',
    duration: '6 hrs',
    level: 'Beginner',
    color: '#3B82F6',
    lessons: [
      { id: 'l1', title: 'Introduction to Digital Marketing', duration: '18 min' },
      { id: 'l2', title: 'Understanding SEO Basics', duration: '22 min' },
      { id: 'l3', title: 'Social Media Strategy', duration: '25 min' },
      { id: 'l4', title: 'Google Ads & PPC Campaigns', duration: '30 min' },
      { id: 'l5', title: 'Email Marketing Essentials', duration: '20 min' },
      { id: 'l6', title: 'Analytics and Reporting', duration: '25 min' },
    ],
  },
  {
    id: '2',
    title: 'Basic Computer Skills',
    description: 'A beginner-friendly course covering computer operations, Microsoft Office, internet usage, and email communication for everyday work.',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80',
    instructor: 'Priya Rawat',
    duration: '4 hrs',
    level: 'Beginner',
    color: '#10B981',
    lessons: [
      { id: 'l1', title: 'Getting Started with Computers', duration: '15 min' },
      { id: 'l2', title: 'Working with Microsoft Word', duration: '20 min' },
      { id: 'l3', title: 'Excel for Beginners', duration: '22 min' },
      { id: 'l4', title: 'Internet and Email Basics', duration: '18 min' },
      { id: 'l5', title: 'Online Safety and Privacy', duration: '12 min' },
    ],
  },
  {
    id: '3',
    title: 'Spoken English for Professionals',
    description: 'Improve your English speaking skills for interviews, office communication, and daily professional interactions with confidence.',
    thumbnail: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=600&q=80',
    instructor: 'Sunita Mehra',
    duration: '5 hrs',
    level: 'Intermediate',
    color: '#F59E0B',
    lessons: [
      { id: 'l1', title: 'Building Your Vocabulary', duration: '20 min' },
      { id: 'l2', title: 'Grammar in Daily Conversations', duration: '25 min' },
      { id: 'l3', title: 'Speaking in Interviews', duration: '28 min' },
      { id: 'l4', title: 'Presentations and Public Speaking', duration: '30 min' },
      { id: 'l5', title: 'Email & Written Communication', duration: '20 min' },
    ],
  },
  {
    id: '4',
    title: 'Tailoring & Garment Making',
    description: 'Learn professional tailoring from scratch — pattern making, stitching, and garment finishing for women\'s and men\'s wear.',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    instructor: 'Kamla Devi',
    duration: '8 hrs',
    level: 'All Levels',
    color: '#8B5CF6',
    lessons: [
      { id: 'l1', title: 'Introduction to Tailoring Tools', duration: '20 min' },
      { id: 'l2', title: 'Taking Measurements', duration: '18 min' },
      { id: 'l3', title: 'Pattern Making Basics', duration: '35 min' },
      { id: 'l4', title: 'Stitching a Basic Blouse', duration: '40 min' },
      { id: 'l5', title: 'Garment Finishing Techniques', duration: '30 min' },
      { id: 'l6', title: 'Advanced Pattern Cutting', duration: '35 min' },
    ],
  },
];

// ─── Mock Video Player ──────────────────────────────────────────────────────────
function VideoPlayer({
  lesson,
  course,
  onClose,
}: {
  lesson: { id: string; title: string; duration: string };
  course: typeof COURSES[0];
  onClose: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startProgress = () => {
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(intervalRef.current!);
          setPlaying(false);
          return 100;
        }
        return p + 0.5;
      });
    }, 150);
  };

  const handlePlayPause = () => {
    if (playing) {
      clearInterval(intervalRef.current!);
      setPlaying(false);
    } else {
      setPlaying(true);
      startProgress();
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const totalSecs = parseInt(lesson.duration) * 60;
  const elapsed = Math.floor((progress / 100) * totalSecs);
  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <View style={vp.container}>
      {/* Video area */}
      <View style={vp.videoArea}>
        <Image source={{ uri: course.thumbnail }} style={vp.thumb} blurRadius={playing ? 0 : 3} />
        <LinearGradient colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']} style={vp.overlay} />

        {/* Close button */}
        <TouchableOpacity style={vp.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>

        {/* Center play */}
        <TouchableOpacity style={vp.playBtn} onPress={handlePlayPause}>
          <Ionicons name={playing ? 'pause' : 'play'} size={36} color="#fff" />
        </TouchableOpacity>

        {/* Title overlay */}
        <View style={vp.titleOverlay}>
          <Text style={vp.lessonTitle} numberOfLines={2}>{lesson.title}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={vp.controls}>
        {/* Progress bar */}
        <View style={vp.progressBar}>
          <View style={[vp.progressFill, { width: `${progress}%` }]} />
        </View>
        <View style={vp.timeRow}>
          <Text style={vp.timeText}>{fmt(elapsed)}</Text>
          <Text style={vp.timeText}>{lesson.duration}</Text>
        </View>

        {/* Buttons */}
        <View style={vp.btnRow}>
          <TouchableOpacity style={vp.ctrlBtn} onPress={() => { setProgress(0); setPlaying(false); clearInterval(intervalRef.current!); }}>
            <Ionicons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={vp.centerBtn} onPress={handlePlayPause}>
            <Ionicons name={playing ? 'pause' : 'play'} size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={vp.ctrlBtn}>
            <Ionicons name="volume-high-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={vp.courseLabel}>{course.title}</Text>
      </View>
    </View>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function SkillTrainingScreen() {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<typeof COURSES[0] | null>(null);
  const [playingLesson, setPlayingLesson] = useState<typeof COURSES[0]['lessons'][0] | null>(null);

  // ── Video Player Modal ──
  if (playingLesson && selectedCourse) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }} edges={['top']}>
        <VideoPlayer
          lesson={playingLesson}
          course={selectedCourse}
          onClose={() => setPlayingLesson(null)}
        />
      </SafeAreaView>
    );
  }

  // ── Course Detail ──
  if (selectedCourse) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={[selectedCourse.color, selectedCourse.color + 'CC']} style={styles.detailHeader}>
          <TouchableOpacity onPress={() => setSelectedCourse(null)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.detailHeaderTitle} numberOfLines={1}>{selectedCourse.title}</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Thumbnail */}
          <Image source={{ uri: selectedCourse.thumbnail }} style={styles.detailThumb} />

          {/* Info */}
          <View style={styles.detailInfo}>
            <Text style={styles.detailTitle}>{selectedCourse.title}</Text>
            <Text style={styles.detailDesc}>{selectedCourse.description}</Text>

            <View style={styles.metaRow}>
              <MetaChip icon="person-outline" label={selectedCourse.instructor} color="#3B82F6" />
              <MetaChip icon="time-outline" label={selectedCourse.duration} color="#10B981" />
              <MetaChip icon="bar-chart-outline" label={selectedCourse.level} color="#8B5CF6" />
            </View>
          </View>

          {/* Lessons */}
          <View style={styles.lessonsSection}>
            <Text style={styles.lessonsSectionTitle}>
              {selectedCourse.lessons.length} Lessons
            </Text>
            {selectedCourse.lessons.map((lesson, idx) => (
              <TouchableOpacity
                key={lesson.id}
                style={styles.lessonRow}
                onPress={() => setPlayingLesson(lesson)}
              >
                <View style={[styles.lessonIdx, { backgroundColor: selectedCourse.color + '20' }]}>
                  <Text style={[styles.lessonIdxText, { color: selectedCourse.color }]}>{idx + 1}</Text>
                </View>
                <View style={styles.lessonInfo}>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                </View>
                <Ionicons name="play-circle" size={28} color={selectedCourse.color} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Course List ──
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="construct" size={44} color="#fff" />
          <Text style={styles.headerTitle}>Skill Training</Text>
          <Text style={styles.headerSubtitle}>Free courses to boost your career</Text>
        </View>
      </LinearGradient>

      <FlatList
        data={COURSES}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.courseCard}
            onPress={() => setSelectedCourse(item)}
            activeOpacity={0.87}
          >
            <Image source={{ uri: item.thumbnail }} style={styles.courseThumb} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.75)']}
              style={styles.courseGradient}
            />
            <View style={styles.courseMeta}>
              <View style={[styles.levelBadge, { backgroundColor: item.color }]}>
                <Text style={styles.levelBadgeText}>{item.level}</Text>
              </View>
            </View>
            <View style={styles.courseBody}>
              <Text style={styles.courseTitle}>{item.title}</Text>
              <Text style={styles.courseDesc} numberOfLines={2}>{item.description}</Text>
              <View style={styles.courseFooter}>
                <View style={styles.footerItem}>
                  <Ionicons name="person-outline" size={12} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.footerText}>{item.instructor}</Text>
                </View>
                <View style={styles.footerItem}>
                  <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.footerText}>{item.duration}</Text>
                </View>
                <View style={styles.footerItem}>
                  <Ionicons name="list-outline" size={12} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.footerText}>{item.lessons.length} lessons</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

function MetaChip({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <View style={[mc.chip, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon as any} size={13} color={color} />
      <Text style={[mc.text, { color }]}>{label}</Text>
    </View>
  );
}

const mc = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  text: { fontSize: 12, fontWeight: '600' },
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  header: { paddingBottom: 28, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  backButton: {
    margin: 16, width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  headerContent: { alignItems: 'center', paddingHorizontal: 24 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginTop: 12, marginBottom: 6 },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },

  // Course card (list)
  courseCard: {
    borderRadius: 18, overflow: 'hidden', marginBottom: 16, height: 200,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 10, elevation: 5,
  },
  courseThumb: { position: 'absolute', width: '100%', height: '100%' },
  courseGradient: { position: 'absolute', width: '100%', height: '100%' },
  courseMeta: { position: 'absolute', top: 12, right: 12 },
  levelBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  levelBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  courseBody: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14 },
  courseTitle: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 4 },
  courseDesc: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  courseFooter: { flexDirection: 'row', gap: 12 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },

  // Detail header
  detailHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 8, paddingBottom: 16, paddingHorizontal: 8,
  },
  detailHeaderTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#fff', textAlign: 'center' },

  // Detail content
  detailThumb: { width: '100%', height: 220 },
  detailInfo: { padding: 16 },
  detailTitle: { fontSize: 20, fontWeight: '800', color: '#1F2937', marginBottom: 8 },
  detailDesc: { fontSize: 14, color: '#4B5563', lineHeight: 22, marginBottom: 12 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  // Lessons
  lessonsSection: { paddingHorizontal: 16 },
  lessonsSectionTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937', marginBottom: 12 },
  lessonRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, padding: 14, marginBottom: 10, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  lessonIdx: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  lessonIdxText: { fontSize: 15, fontWeight: '800' },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  lessonDuration: { fontSize: 12, color: '#6B7280' },
});

// ─── Video Player Styles ───────────────────────────────────────────────────────
const vp = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  videoArea: { height: 280, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  thumb: { position: 'absolute', width: '100%', height: '100%' },
  overlay: { position: 'absolute', width: '100%', height: '100%' },
  closeBtn: {
    position: 'absolute', top: 16, left: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
  },
  playBtn: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
  },
  titleOverlay: {
    position: 'absolute', bottom: 12, left: 16, right: 16,
  },
  lessonTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  controls: { flex: 1, padding: 20 },
  progressBar: {
    height: 4, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2, marginBottom: 8, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 2 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  timeText: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  btnRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 24 },
  ctrlBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  centerBtn: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center',
  },
  courseLabel: { textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)' },
});

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@safegrow/db';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import AdminLayout from '../../../components/AdminLayout';
import styles from './page.module.css';
import RouteMap from './RouteMap';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function getPresignedUrl(photoUrl: string | null): Promise<string | null> {
  if (!photoUrl) return null;
  if (!photoUrl.includes('amazonaws.com')) return photoUrl;

  try {
    const bucketName = process.env.AWS_S3_BUCKET_NAME!;
    const urlParts = new URL(photoUrl);
    const key = urlParts.pathname.substring(1);

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return photoUrl;
  }
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(date));
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(date));
}

export default async function EmployeeDetailPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  
  // Fetch user details, including their manager and any subordinates
  const employee = await prisma.user.findUnique({
    where: { id },
    include: {
      manager: true,
      subordinates: {
        include: {
          attendances: {
            orderBy: { date: 'desc' },
            take: 1,
            include: { visits: true }
          }
        }
      },
      attendances: {
        orderBy: { date: 'desc' },
        take: 30, // Fetch last 30 days
        include: { locationPings: { orderBy: { time: 'asc' } } }
      },
      visits: {
        orderBy: { time: 'desc' },
        take: 50 // Fetch recent visits
      }
    }
  });

  if (!employee) {
    notFound();
  }

  const isManager = employee.role === 'MANAGER';
  const defaultTab = isManager ? 'team' : 'day';
  const activeTab = (resolvedSearchParams.tab as string) || defaultTab;

  // Helpers for Rep views
  const today = new Date();
  const todayVisits = employee.visits.filter(v => new Date(v.time).toDateString() === today.toDateString());
  const todayAttendance = employee.attendances.find(a => new Date(a.date).toDateString() === today.toDateString());
  const checkInStr = todayAttendance ? formatTime(todayAttendance.checkInTime) : '--:--';
  const checkOutStr = (todayAttendance && todayAttendance.checkOutTime) ? formatTime(todayAttendance.checkOutTime) : '--:--';
  
  const checkInLocation = todayAttendance ? { lat: todayAttendance.checkInLat, lng: todayAttendance.checkInLng, time: todayAttendance.checkInTime } : undefined;
  const checkOutLocation = (todayAttendance && todayAttendance.checkOutTime && todayAttendance.checkOutLat && todayAttendance.checkOutLng) 
    ? { lat: todayAttendance.checkOutLat, lng: todayAttendance.checkOutLng, time: todayAttendance.checkOutTime } : undefined;
  const todayLocationPings = todayAttendance?.locationPings || [];

  let displayCheckInPhotoUrl = null;
  let displayCheckOutPhotoUrl = null;
  let displayVisitPhotoUrl = null;

  if (employee.attendances.length > 0) {
    displayCheckInPhotoUrl = await getPresignedUrl(employee.attendances[0].checkInPhotoUrl);
    displayCheckOutPhotoUrl = await getPresignedUrl(employee.attendances[0].checkOutPhotoUrl);
  }

  if (todayVisits.length > 0) {
    displayVisitPhotoUrl = await getPresignedUrl(todayVisits[0].photoUrl);
  }

  return (
    <AdminLayout>
      <div className={styles.container}>
        
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Link href="/employees" className={styles.backBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Link>
            
            <div className={styles.avatarLarge}>{getInitials(employee.name)}</div>
            
            <div className={styles.headerInfo}>
              <div className={styles.nameRow}>
                <h1 className={styles.name}>{employee.name}</h1>
                <span className={styles.badge}>{isManager ? 'Manager' : 'Rep'}</span>
                <span className={styles.status}>
                  <div className={styles.statusDotGreen}></div> Active
                </span>
              </div>
              <div className={styles.metaRow}>
                <span>{employee.employeeId || 'EMP-1000'}</span>
                <span className={styles.metaDot}>•</span>
                <span>{employee.territory || 'Unassigned Region'}</span>
                <span className={styles.metaDot}>•</span>
                {isManager ? (
                  <><span>{employee.subordinates.length} reps</span><span className={styles.metaDot}>•</span></>
                ) : (
                  employee.manager && <><span>Manager: {employee.manager.name}</span><span className={styles.metaDot}>•</span></>
                )}
                <span>Phone:{employee.phone || '+91 98765 43210'}</span>
              </div>
            </div>
          </div>
          
          <Link href={`/employees/${employee.id}/edit`} className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', height: '40px', borderRadius: '8px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
            Edit
          </Link>
        </div>

        {/* Tabs */}
        <div className={styles.tabsContainer}>
          {isManager ? (
            <>
              <Link href={`/employees/${employee.id}?tab=team`} className={`${styles.tab} ${activeTab === 'team' ? styles.activeTab : ''}`}>Team</Link>
              <Link href={`/employees/${employee.id}?tab=activity`} className={`${styles.tab} ${activeTab === 'activity' ? styles.activeTab : ''}`}>Activity</Link>
            </>
          ) : (
            <>
              <Link href={`/employees/${employee.id}?tab=day`} className={`${styles.tab} ${activeTab === 'day' ? styles.activeTab : ''}`}>Day</Link>
              <Link href={`/employees/${employee.id}?tab=attendance`} className={`${styles.tab} ${activeTab === 'attendance' ? styles.activeTab : ''}`}>Attendance</Link>
              <Link href={`/employees/${employee.id}?tab=visits`} className={`${styles.tab} ${activeTab === 'visits' ? styles.activeTab : ''}`}>Visits</Link>
            </>
          )}
        </div>

        {/* Tab Content Area */}
        <div className={styles.contentArea}>
          
          {/* MANAGER: TEAM TAB */}
          {isManager && activeTab === 'team' && (
            <div className={styles.teamTab}>
              <h3 className={styles.sectionTitle}>Team • {employee.subordinates.length} representatives</h3>
              <div className={styles.teamGrid}>
                {employee.subordinates.length > 0 ? employee.subordinates.map((sub: any) => {
                  const latestAtt = sub.attendances && sub.attendances[0];
                  const visitCount = latestAtt?.visits?.length || 0;
                  const isCheckedIn = !!latestAtt && !latestAtt.checkOutTime;
                  const isCheckedOut = !!latestAtt && !!latestAtt.checkOutTime;
                  const statusStr = isCheckedIn ? `Checked in - ${visitCount} visits` : isCheckedOut ? `Checked out - ${visitCount} visits` : 'No activity today';

                  return (
                    <Link href={`/employees/${sub.id}`} key={sub.id} className={styles.teamCard}>
                      <div className={styles.teamAvatar}>{getInitials(sub.name)}</div>
                      <div className={styles.teamInfo}>
                        <div className={styles.teamName}>{sub.name}</div>
                        <div className={styles.teamStatus}>
                          {isCheckedIn && <div className={styles.statusDotGreen} style={{ width: 6, height: 6 }}></div>}
                          {statusStr}
                        </div>
                      </div>
                      <svg className={styles.chevron} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                    </Link>
                  );
                }) : (
                  <div className={styles.emptyState}>No team members assigned.</div>
                )}
              </div>
            </div>
          )}

          {/* REP: DAY TAB */}
          {!isManager && activeTab === 'day' && (
            <div className={styles.dayTab}>
              <div className={styles.dayTopBar}>
                <div className={styles.dayStats}>
                  <span className={styles.statPill}>In {checkInStr}</span>
                  <span className={styles.statPill}>Out {checkOutStr}</span>
                  <span className={styles.statPill}>{todayVisits.length} visits</span>
                </div>
                <div className={styles.dateSelector}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                  <span>{formatDate(today)}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </div>
              </div>
              <div className={styles.dayContent}>
                <div className={styles.mapPlaceholderLarge}>
                  <RouteMap 
                    apiKey={process.env.GOOGLE_MAPS_API_KEY || ''}
                    pings={todayLocationPings}
                    visits={todayVisits}
                    checkInLocation={checkInLocation}
                    checkOutLocation={checkOutLocation}
                  />
                </div>
                <div className={styles.dayVisitsSidebar}>
                  <h3 className={styles.visitsTitle}>Visits</h3>
                  <div className={styles.visitsList}>
                    {todayVisits.length > 0 ? todayVisits.map((v, i) => (
                      <div className={styles.visitItem} key={v.id}>
                        <div className={styles.visitNumber}>{todayVisits.length - i}</div>
                        <div className={styles.visitInfo}>
                          <div className={styles.visitName}>{v.vendorName || 'Unknown Vendor'}</div>
                          <div className={styles.visitTime}>{formatTime(v.time)} · {v.area || 'Unknown Area'}</div>
                        </div>
                        <div className={`${styles.badgeOutcome} ${v.outcome === 'ORDER_PLACED' ? styles.badgeOrder : styles.badgeMet}`}>
                          {v.outcome === 'ORDER_PLACED' ? 'Order' : v.outcome === 'MET' ? 'Met' : 'N/A'}
                        </div>
                      </div>
                    )) : (
                      <div className={styles.emptyState} style={{ padding: '2rem 0' }}>No visits recorded today.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REP: ATTENDANCE TAB */}
          {!isManager && activeTab === 'attendance' && (
            <div className={styles.attendanceTab}>
              <div className={styles.attSidebar}>
                <div className={styles.monthSelector}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                  <span>This Month</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </div>
                <div className={styles.daysList}>
                  {employee.attendances.length > 0 ? employee.attendances.map((att, i) => {
                    const isToday = new Date(att.date).toDateString() === today.toDateString();
                    let durationStr = 'Incomplete';
                    if (att.checkOutTime) {
                      const ms = new Date(att.checkOutTime).getTime() - new Date(att.checkInTime).getTime();
                      const hrs = Math.floor(ms / (1000 * 60 * 60));
                      const mins = Math.floor((ms / (1000 * 60)) % 60);
                      durationStr = `${hrs}h ${mins}m`;
                    }
                    return (
                      <div key={att.id} className={`${styles.dayItem} ${isToday ? styles.dayActive : ''}`}>
                        <span>{formatDate(att.date)}</span>
                        <span className={att.checkOutTime ? styles.dayDuration : styles.dayIncomplete}>{durationStr}</span>
                      </div>
                    );
                  }) : (
                    <div className={styles.emptyState}>No attendance records.</div>
                  )}
                </div>
              </div>
              
              <div className={styles.attMain}>
                {employee.attendances.length > 0 ? (
                  <>
                    <div className={styles.attMainHeader}>
                      <h3>{formatDate(employee.attendances[0].date)}</h3>
                      <span className={styles.attTotalTime}>
                        {employee.attendances[0].checkOutTime 
                          ? `${Math.floor((new Date(employee.attendances[0].checkOutTime!).getTime() - new Date(employee.attendances[0].checkInTime).getTime()) / (1000 * 60 * 60))}h` 
                          : 'In progress'}
                      </span>
                    </div>
                    <div className={styles.proofCardsRow}>
                      <div className={styles.proofCard}>
                        <div className={styles.proofHeader}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2c7a3f" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
                          Check in · {formatTime(employee.attendances[0].checkInTime)}
                        </div>
                        <div className={styles.photoPlaceholder}>
                          {displayCheckInPhotoUrl ? (
                            <img src={displayCheckInPhotoUrl} alt="Check In" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                          ) : (
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a0aab0" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          )}
                          <div className={styles.coordsOverlay}>
                            <div className={styles.coordsLat}>{employee.attendances[0].checkInLat.toFixed(4)}, {employee.attendances[0].checkInLng.toFixed(4)}</div>
                            <div className={styles.coordsTime}>{formatDate(employee.attendances[0].date)} · {formatTime(employee.attendances[0].checkInTime)}</div>
                          </div>
                        </div>
                      </div>
                      
                      {employee.attendances[0].checkOutTime && (
                        <div className={styles.proofCard}>
                          <div className={styles.proofHeader}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2c7a3f" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                            Check out · {formatTime(employee.attendances[0].checkOutTime)}
                          </div>
                          <div className={styles.photoPlaceholder}>
                            {displayCheckOutPhotoUrl ? (
                              <img src={displayCheckOutPhotoUrl} alt="Check Out" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                            ) : (
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a0aab0" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            )}
                            <div className={styles.coordsOverlay}>
                              <div className={styles.coordsLat}>{employee.attendances[0].checkOutLat?.toFixed(4)}, {employee.attendances[0].checkOutLng?.toFixed(4)}</div>
                              <div className={styles.coordsTime}>{formatDate(employee.attendances[0].date)} · {formatTime(employee.attendances[0].checkOutTime)}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className={styles.emptyState} style={{ padding: '4rem', textAlign: 'center' }}>No attendance data to display for this month.</div>
                )}
              </div>
            </div>
          )}

          {/* REP: VISITS TAB */}
          {!isManager && activeTab === 'visits' && (
            <div className={styles.visitsTabFull}>
              <div className={styles.vListSidebar}>
                <div className={styles.vListHeader}>{formatDate(today)} · {todayVisits.length} visits</div>
                
                {todayVisits.length > 0 ? todayVisits.map((v, i) => (
                  <div key={v.id} className={`${styles.vListItem} ${i === 0 ? styles.vListItemActive : ''}`}>
                    <div className={styles.vListIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a0aab0" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                    <div className={styles.vListInfo}>
                      <div className={styles.vListName}>{v.vendorName || 'Unknown'}</div>
                      <div className={styles.vListTime}>{formatTime(v.time)} · {v.area || 'Unknown'}</div>
                    </div>
                    <div className={v.outcome === 'ORDER_PLACED' ? styles.vListOutcomeOrder : styles.vListOutcomeMet}>
                      {v.outcome === 'ORDER_PLACED' ? 'Order' : v.outcome === 'MET' ? 'Met' : 'N/A'}
                    </div>
                  </div>
                )) : (
                  <div className={styles.emptyState} style={{ padding: '2rem' }}>No visits recorded today.</div>
                )}
              </div>
              
              <div className={styles.vDetailsMain}>
                {todayVisits.length > 0 ? (
                  <>
                    <div className={styles.vPhotoLarge}>
                      {displayVisitPhotoUrl ? (
                        <img src={displayVisitPhotoUrl} alt="Visit Photo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                      ) : (
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a0aab0" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      )}
                      <div className={styles.coordsOverlay}>
                        <div className={styles.coordsLat}>{todayVisits[0].lat.toFixed(4)}, {todayVisits[0].lng.toFixed(4)}</div>
                        <div className={styles.coordsTime}>{formatDate(todayVisits[0].time)} · {formatTime(todayVisits[0].time)}</div>
                      </div>
                    </div>
                    <div className={styles.vMeta}>
                      <h2>{todayVisits[0].vendorName || 'Unknown Vendor'}</h2>
                      <div className={styles.vMetaRow}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {formatTime(todayVisits[0].time)}
                      </div>
                      <div className={styles.vMetaRow}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
                        Area: {todayVisits[0].area || 'Unknown Area'}
                      </div>
                      <div className={styles.vMetaRow}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {todayVisits[0].lat.toFixed(4)}, {todayVisits[0].lng.toFixed(4)}
                      </div>
                      <div className={styles.badgeOutcomeLargeOrder}>
                        {todayVisits[0].outcome === 'ORDER_PLACED' ? 'Order placed' : todayVisits[0].outcome === 'MET' ? 'Met successfully' : 'Not available'}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className={styles.emptyState} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '400px', backgroundColor: '#fafbfa', borderRadius: 'var(--radius-lg)' }}>
                    Select a visit to view proof.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </AdminLayout>
  );
}

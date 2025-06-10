using AttendanceAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace AttendanceAPI.Data
{
    public class AttendanceDbContext : DbContext
    {
        public AttendanceDbContext(DbContextOptions<AttendanceDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<AttendanceRecord> AttendanceRecords { get; set; }
        public DbSet<BreakRecord> BreakRecords { get; set; }
        public DbSet<ApprovalRequest> ApprovalRequests { get; set; }
        public DbSet<FaceData> FaceData { get; set; }
        public DbSet<Settings> Settings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User relationships
            modelBuilder.Entity<User>()
                .HasOne(u => u.Manager)
                .WithMany(u => u.Subordinates)
                .HasForeignKey(u => u.ManagerId)
                .OnDelete(DeleteBehavior.Restrict);

            // AttendanceRecord relationships
            modelBuilder.Entity<AttendanceRecord>()
                .HasOne(ar => ar.User)
                .WithMany(u => u.AttendanceRecords)
                .HasForeignKey(ar => ar.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // BreakRecord relationships
            modelBuilder.Entity<BreakRecord>()
                .HasOne(br => br.AttendanceRecord)
                .WithMany(ar => ar.Breaks)
                .HasForeignKey(br => br.AttendanceRecordId)
                .OnDelete(DeleteBehavior.Cascade);

            // ApprovalRequest relationships
            modelBuilder.Entity<ApprovalRequest>()
                .HasOne(ar => ar.User)
                .WithMany(u => u.ApprovalRequests)
                .HasForeignKey(ar => ar.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // FaceData relationships
            modelBuilder.Entity<FaceData>()
                .HasOne(fd => fd.User)
                .WithOne(u => u.FaceData)
                .HasForeignKey<FaceData>(fd => fd.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Indexes
            modelBuilder.Entity<User>()
                .HasIndex(u => u.EmployeeId)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<AttendanceRecord>()
                .HasIndex(ar => new { ar.UserId, ar.Date })
                .IsUnique();

            // Decimal precision
            modelBuilder.Entity<AttendanceRecord>()
                .Property(ar => ar.TotalWorkHours)
                .HasPrecision(5, 2);
        }
    }
}
package com.enterprisepm.service;

import com.enterprisepm.model.*;
import com.enterprisepm.repository.*;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    public byte[] generateProjectReport(Long projectId) throws IOException {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        List<Task> tasks = taskRepository.findByProjectId(projectId);

        Workbook workbook = new XSSFWorkbook();

        Sheet summarySheet = workbook.createSheet("Project Summary");
        CellStyle boldStyle = workbook.createCellStyle();
        Font boldFont = workbook.createFont();
        boldFont.setBold(true);
        boldStyle.setFont(boldFont);

        String[][] summaryData = {
            {"Project Name",  project.getName()},
            {"Description",   project.getDescription()},
            {"Status",        project.getStatus().name()},
            {"Start Date",    project.getStartDate() != null ? project.getStartDate().toString() : ""},
            {"End Date",      project.getEndDate() != null ? project.getEndDate().toString() : ""},
            {"Owner",         project.getOwner() != null ? project.getOwner().getName() : ""},
            {"Total Tasks",   String.valueOf(tasks.size())},
            {"Completed",     String.valueOf(tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count())},
            {"In Progress",   String.valueOf(tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count())},
            {"To Do",         String.valueOf(tasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count())}
        };

        for (int i = 0; i < summaryData.length; i++) {
            Row row = summarySheet.createRow(i);
            Cell labelCell = row.createCell(0);
            labelCell.setCellValue(summaryData[i][0]);
            labelCell.setCellStyle(boldStyle);
            row.createCell(1).setCellValue(summaryData[i][1]);
        }
        summarySheet.autoSizeColumn(0);
        summarySheet.autoSizeColumn(1);

        Sheet taskSheet = workbook.createSheet("Tasks");
        Row header = taskSheet.createRow(0);
        String[] taskHeaders = {"ID", "Title", "Status", "Priority", "Assigned To", "Start Date", "End Date"};
        for (int i = 0; i < taskHeaders.length; i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(taskHeaders[i]);
            cell.setCellStyle(boldStyle);
        }
        for (int i = 0; i < tasks.size(); i++) {
            Task t = tasks.get(i);
            Row row = taskSheet.createRow(i + 1);
            row.createCell(0).setCellValue(t.getId());
            row.createCell(1).setCellValue(t.getTitle());
            row.createCell(2).setCellValue(t.getStatus().name());
            row.createCell(3).setCellValue(t.getPriority().name());
            row.createCell(4).setCellValue(t.getAssignedTo() != null ? t.getAssignedTo().getName() : "Unassigned");
            row.createCell(5).setCellValue(t.getStartDate() != null ? t.getStartDate().toString() : "");
            row.createCell(6).setCellValue(t.getEndDate() != null ? t.getEndDate().toString() : "");
        }
        for (int i = 0; i < taskHeaders.length; i++) taskSheet.autoSizeColumn(i);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();
        return out.toByteArray();
    }
}

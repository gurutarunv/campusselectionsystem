package com.campusplacement.service.impl;

import com.campusplacement.dto.StoredFile;
import com.campusplacement.exception.FileStorageException;
import com.campusplacement.exception.InvalidFileTypeException;
import com.campusplacement.service.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
public class LocalFileStorageService implements FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(LocalFileStorageService.class);
    private static final byte[] PDF_MAGIC_BYTES = new byte[]{0x25, 0x50, 0x44, 0x46}; // %PDF

    private final Path storageLocation;
    private final long maxFileSizeBytes;

    public LocalFileStorageService(
            @Value("${app.storage.upload-dir:uploads/resumes}") String uploadDir,
            @Value("${app.storage.max-file-size-bytes:5242880}") long maxFileSizeBytes) {
        this.storageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.maxFileSizeBytes = maxFileSizeBytes;

        try {
            Files.createDirectories(this.storageLocation);
            log.info("Initialized secure file storage location at: {}", this.storageLocation);
        } catch (IOException e) {
            throw new FileStorageException("Could not initialize local storage directory at: " + this.storageLocation, e);
        }
    }

    @Override
    public StoredFile storePdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileTypeException("Please select a PDF file to upload.");
        }

        if (file.getSize() > maxFileSizeBytes) {
            throw new InvalidFileTypeException(String.format("File size (%d bytes) exceeds the allowed limit of %d MB.",
                    file.getSize(), maxFileSizeBytes / (1024 * 1024)));
        }

        String rawFilename = StringUtils.cleanPath(Objects.requireNonNullElse(file.getOriginalFilename(), "resume.pdf"));
        if (!rawFilename.toLowerCase().endsWith(".pdf")) {
            throw new InvalidFileTypeException("Only PDF files (.pdf) are allowed.");
        }

        // Verify PDF signature / magic bytes: %PDF
        try (InputStream inputStream = file.getInputStream()) {
            byte[] header = new byte[4];
            int read = inputStream.read(header);
            if (read < 4 || header[0] != PDF_MAGIC_BYTES[0] || header[1] != PDF_MAGIC_BYTES[1] ||
                    header[2] != PDF_MAGIC_BYTES[2] || header[3] != PDF_MAGIC_BYTES[3]) {
                throw new InvalidFileTypeException("Uploaded file does not have a valid PDF binary signature.");
            }
        } catch (IOException e) {
            throw new FileStorageException("Failed to inspect uploaded file contents.", e);
        }

        // Generate safe unique server storage filename
        String safeOriginalName = rawFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        String uniqueStorageName = UUID.randomUUID().toString() + "_" + System.currentTimeMillis() + ".pdf";

        try {
            Path targetLocation = this.storageLocation.resolve(uniqueStorageName).normalize();
            if (!targetLocation.startsWith(this.storageLocation)) {
                throw new FileStorageException("Cannot store file outside current directory (Path traversal blocked).");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }

            log.info("Successfully stored resume: original='{}', storedAs='{}', size={} bytes",
                    safeOriginalName, uniqueStorageName, file.getSize());

            return new StoredFile(safeOriginalName, uniqueStorageName, "application/pdf", file.getSize());
        } catch (IOException e) {
            throw new FileStorageException("Could not store file " + safeOriginalName + ". Please try again.", e);
        }
    }

    @Override
    public Resource loadAsResource(String storageFileName) {
        if (!StringUtils.hasText(storageFileName)) {
            throw new FileStorageException("Invalid filename requested.");
        }

        try {
            Path filePath = this.storageLocation.resolve(storageFileName).normalize();
            if (!filePath.startsWith(this.storageLocation)) {
                throw new FileStorageException("Access denied: Path traversal detected.");
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new FileStorageException("File not found or unreadable: " + storageFileName);
            }
        } catch (MalformedURLException e) {
            throw new FileStorageException("File URL malformed: " + storageFileName, e);
        }
    }

    @Override
    public void deleteFile(String storageFileName) {
        if (!StringUtils.hasText(storageFileName)) {
            return;
        }

        try {
            Path filePath = this.storageLocation.resolve(storageFileName).normalize();
            if (filePath.startsWith(this.storageLocation)) {
                Files.deleteIfExists(filePath);
                log.info("Deleted previous stored file: {}", storageFileName);
            }
        } catch (IOException e) {
            log.warn("Failed to delete stored file {}: {}", storageFileName, e.getMessage());
        }
    }
}

//작성자 : 오진석
package kr.co.ictedu.back.group.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import kr.co.ictedu.back.group.dao.DocumentDao;
import kr.co.ictedu.back.group.dto.DocumentListDTO;
import kr.co.ictedu.back.group.vo.DocumentVO;

@Service
public class DocumentService {

	@Autowired
	private DocumentDao dao;
	
	@Value("${spring.servlet.multipart.location}")
	private String uploadDir;
	
	@Transactional
	public void addDocument(Long groupNum, Long memberNum, String title, MultipartFile file) throws IOException {
		if (file == null || file.isEmpty()) {
			throw new IllegalArgumentException("업로드할 파일이 없습니다.");
		}
		DocumentVO document = new DocumentVO();
		
		Path uploadPath = Paths.get(uploadDir);
		
		if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
		String originalName = file.getOriginalFilename();
		String extension = "";
		
		if (originalName != null && originalName.contains(".")) {
			extension = originalName.substring(originalName.lastIndexOf(".")+1);
		}
		
		String storedName = UUID.randomUUID().toString() + (extension.isEmpty() ? "" : "." + extension);
		Path target = uploadPath.resolve(storedName);
		file.transferTo(target.toFile());
			
		document.setGroup_num(groupNum);
		document.setMember_num(memberNum);
		document.setDocument_title(title);
		document.setOriginal_name(originalName);
		document.setStored_name(storedName);
		document.setDocument_path(target.toString());
		document.setDocument_type(extension);
		document.setDocument_size(file.getSize());
		
		document.setHit(0L);
		dao.addDocument(document);
	}
	
	public List<DocumentListDTO> getDocuments(Long groupNum, Long memberNum) {
		DocumentVO documentvo = new DocumentVO();
		
		documentvo.setGroup_num(groupNum);
		documentvo.setMember_num(memberNum);
		
		List<DocumentListDTO> list = dao.getDocuments(documentvo);
		return list;
	}
	
	public DocumentVO getDocument(Long documentNum) {
		return dao.getDocumentById(documentNum);
	}
	
	public void increaseHit(long documentNum) {
		dao.increaseHit(documentNum);
	}
	
	public DocumentVO getPatchDocument(Long documentNum) {
		return dao.getPatchDocument(documentNum);
	}
	
	@Transactional
	public void patchDocument(Long documentNum, String title, MultipartFile file) throws IOException {
		DocumentVO request = new DocumentVO();
		request.setDocument_title(title);
		
		if (file != null && !file.isEmpty()) {
			
			DocumentVO oldDocument = dao.getDocumentById(documentNum);
			
			if (oldDocument == null) {
				throw new IllegalArgumentException("존재하지 않는 문서입니다.");
			}
			Path uploadPath = Paths.get(uploadDir);
			
			Files.createDirectories(uploadPath);
			
			String originalName = file.getOriginalFilename();
			String extension = "";
			
			if (originalName != null && originalName.contains(".")) {
				extension = originalName.substring(originalName.lastIndexOf(".")+1);
			}
			String storedName = UUID.randomUUID().toString() + (extension.isEmpty() ? "" : "." + extension);
			Path target = uploadPath.resolve(storedName);
			file.transferTo(target.toFile());
			
			request.setOriginal_name(originalName);
			request.setStored_name(storedName);
			request.setDocument_path(target.toString());
			request.setDocument_type(extension);
			request.setDocument_size(file.getSize());
			
			dao.patchDocument(documentNum, request);
			
			if (oldDocument.getDocument_path() != null) {
				Path oldPath = Paths.get(oldDocument.getDocument_path());
				Files.deleteIfExists(oldPath);
			}
		} else {
			dao.patchDocument(documentNum, request);
		}
	}
	
	@Transactional
	public void deleteDocument(Long documentNum) throws IOException {
		DocumentVO document = dao.getDocumentById(documentNum);
		if (document == null) {
			throw new IllegalArgumentException("존재하지 않는 문서입니다.");
		}
		Path path = Paths.get(document.getDocument_path());
		Files.deleteIfExists(path);
		dao.deleteDocument(documentNum);
	}
}

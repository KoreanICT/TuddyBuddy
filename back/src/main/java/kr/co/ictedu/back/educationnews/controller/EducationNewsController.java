package kr.co.ictedu.back.educationnews.controller;

import java.io.StringReader;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.xml.sax.InputSource;

@RestController
@RequestMapping("/api/education-news")
public class EducationNewsController {

    private static final String RSS_URL = "https://news.google.com/rss/search?q=";
    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(8))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    @GetMapping
    public List<EducationArticle> getEducationNews(
            @RequestParam(name = "range", defaultValue = "7d") String range) {
        if (!List.of("1d", "7d", "30d").contains(range)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "지원하지 않는 조회 기간입니다.");
        }

        String query = "교육 OR 학교 OR 대학 OR 교사 OR 학습 when:" + range;
        String feedUrl = RSS_URL + URLEncoder.encode(query, StandardCharsets.UTF_8)
                + "&hl=ko&gl=KR&ceid=KR%3Ako";
        HttpRequest request = HttpRequest.newBuilder(URI.create(feedUrl))
                .timeout(Duration.ofSeconds(15))
                .header("User-Agent", "TuddyBuddy-EducationNews/1.0")
                .header("Accept", "application/rss+xml, application/xml, text/xml")
                .GET()
                .build();

        try {
            HttpResponse<String> response = HTTP_CLIENT.send(request,
                    HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "교육 뉴스 제공처 응답에 실패했습니다.");
            }
            return parseArticles(response.body());
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "교육 뉴스 요청이 중단되었습니다.");
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "교육 뉴스를 불러오지 못했습니다.");
        }
    }

    private List<EducationArticle> parseArticles(String xml) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
        factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
        factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
        factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");

        var document = factory.newDocumentBuilder().parse(new InputSource(new StringReader(xml)));
        var items = document.getElementsByTagName("item");
        List<EducationArticle> articles = new ArrayList<>();
        for (int index = 0; index < items.getLength(); index++) {
            Node node = items.item(index);
            if (!(node instanceof Element item)) continue;

            String title = childText(item, "title");
            String url = childText(item, "link");
            String publishedAt = childText(item, "pubDate");
            String domain = childText(item, "source");
            if (title.isBlank() || !url.startsWith("https://")) continue;

            int sourceSeparator = Math.max(title.lastIndexOf(" - "), title.lastIndexOf(" – "));
            if (domain.isBlank() && sourceSeparator > 0) {
                domain = title.substring(sourceSeparator + 3).trim();
            }
            if (sourceSeparator > 0) title = title.substring(0, sourceSeparator).trim();
            articles.add(new EducationArticle(url, title, publishedAt,
                    domain.isBlank() ? "Google 뉴스" : domain));
        }
        return articles;
    }

    private String childText(Element parent, String tagName) {
        var nodes = parent.getElementsByTagName(tagName);
        return nodes.getLength() == 0 ? "" : nodes.item(0).getTextContent().trim();
    }

    public record EducationArticle(String url, String title, String publishedAt, String domain) {}
}

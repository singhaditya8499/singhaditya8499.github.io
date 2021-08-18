import React from "react"
import Img from "gatsby-image"
import { Container, Row, Col, Badge } from "react-bootstrap"

const CompanyCard = ({ frontmatter, image }) => {
  const { company, position, startDate, endDate, location } = frontmatter
  return (
    <Container fluid className="m-auto work-history">
      <Img
        fluid={image}
        style={{
          maxHeight: "10vmax",
          maxWidth: "10vmax",
        }}
        className="m-auto"
      />
      <div className="md-font">
        <h4 className="m-auto pt-2">{company}</h4>
        <h6 className="text-muted">{location}</h6>
        <h5 className="mt-2">{position}</h5>
        <h6 className="text-muted mt-2">
          {startDate}-{endDate}
        </h6>
      </div>
    </Container>
  )
}

export default ({ html, frontmatter, image }) => {
  return (
    <Container className="p-1 project-link text-center">
      <Row>
        <Col className="col-md-4 col-12">
          <CompanyCard frontmatter={frontmatter} image={image} />
        </Col>
        <Col className="col-md-8 col-12">
          <p
            className="text-justify mt-2"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </Col>
      </Row>
      <Row>
        <Col className="col-md-4 col-1"></Col>
        <Col className="col-md-8 col-1">
          <div className="d-inline-flex">
            {frontmatter.tags.map(tag => (
              <Badge key={tag} pill className="mr-2 p-0 px-3 resume-tags">
                <h4>
                  <small>{tag}</small>
                </h4>
              </Badge>
            ))}
          </div>
        </Col>
      </Row>
    </Container>
  )
}

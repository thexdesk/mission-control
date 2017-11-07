require 'erb'
require 'date'
require 'rest-client'
require 'json'

# take a file name, return rendered HTML from .erb file
def render_erb(fname)
  ERB.new(
    File.read("src/#{fname}.erb")
  ).result(binding)
end

# fully formatted markdown post
def reddit_post
  str = \
    "[](/# MC // let time = #{session[:time] || 'null'})\n" \
    "[](/# MC // let launch = #{session[:launch] || 'null'})\n" \
    "[](/# MC // let video = #{session[:video] || 'null'})\n" \
    "[](/# MC // END VARS)\n\n" \
    \
    "[](/# MC // INTRO)\n" \
    "#{session[:intro]}\n\n" \
    \
    "[](/# MC // EVENTS)\n" \

  if session[:events]
    str += "### Live Updates\n" \
           "#{format_events session[:events]}\n\n"
  end

  str +
    "[](/# MC // VIEWING)\n" \
    "#{session[:viewing]}\n\n" \
    \
    "[](/# MC // STATS)\n" \
    "#{session[:stats]}\n\n" \
    \
    "[](/# MC // MISSION)\n" \
    "#{session[:mission]}\n\n" \
    \
    "[](/# MC // LANDING)\n" \
    "#{session[:landing]}\n\n" \
    \
    "[](/# MC // RESOURCES)\n" \
    "#{session[:resources]}\n\n" \
    \
    "[](/# MC // PARTICIPATE)\n" \
    "#{session[:participate]}\n\n" \
    \
    '[](/# MC // END)'
end

# get score, number of comments, and html from reddit post id
def post_info(id)
  submission = request.env['redd.session'].from_ids ["t3_#{id}"].to_ary
  {
    'score' => submission[0].score,
    'num_comments' => submission[0].num_comments,
    'html' => submission[0].selftext_html
  }
end

# create a self post with a given title and text
# subreddit should be set in environment variables
def make_post(title, text = '')
  request
    .env['redd.session']
    .subreddit(ENV['SUBREDDIT'])
    .submit title,
      text: text,
      sendreplies: false
end

def update_post(create_only = false)
  title = "r/SpaceX #{session[:launch]} Official Launch Discussion & " \
          'Updates Thread'

  # post doesn't exist, create with no content
  if create_only && session[:post].nil?
    post = make_post title
    session[:post] = post.id

  # post doesn't exist, create with content
  elsif session[:post].nil?
    post = make_post title, reddit_post
    session[:post] = post.id

  # post exists, update content
  else
    post = request.env['redd.session'].from_ids ["t3_#{session[:post]}"]
    post[0].edit reddit_post
  end

  post_info(session[:post])['html']
end

# get list of events and return a formatted table
def format_events(events)
  return if events.nil?
  str = "| Time | Update |\n" \
        '| --- | --- |'
  events.each do |event|
    next if event[2] == '' || !event[0] # must have message and be "posted"
    str += "\n| #{event[1]} | #{event[2]} |"
  end
  str
end

# get all launches within 7 days
def upcoming_launches
  d = Date.today
  today = d.to_s
  one_week = (d + 7).to_s

  params = {
    params: {
      start: today,
      final: one_week
    }
  }
  api_endpoint = 'https://api.spacexdata.com/v1/launches/upcoming'
  resp = RestClient.get api_endpoint, params

  # read data from API, reformat to hash of mission -> launch time
  launches = {}
  JSON.parse(resp.body).each do |obj|
    payload = obj['payloads'][0]['payload_id']
    payload = payload[7..-1] if payload.start_with? 'SpaceX ' # CRS missions
    launches[payload] = DateTime.parse(obj['launch_date_utc']).strftime('%s')
  end
  launches
end
